import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";
import { JavaScriptSerializer, pages } from "mendixmodelsdk";

const config = require("../config/config.json");
const apps = require("../config/apps.json");
const regexes = require("../config/regexes.json");

main().catch(console.error);

async function main() {
  // 1. Set up your Mendix Model SDK client with your Mendix PAT:
  setPlatformConfig({ mendixToken: config.mendixtoken });
  const mxClient = new MendixPlatformClient();

  const regexList = transformList(regexes);

  // Iterate over your list of projects:
  for (const app of apps) {
    // 2. Load the project:
    console.log(`Opening project: ${app.name} with id: ${app.id} and branch: ${app.branch}`);
    const myMendixApp = mxClient.getApp(app.id);
    const mxWorkingCopy = await myMendixApp.createTemporaryWorkingCopy(app.branch);
    const myMendixModel = await mxWorkingCopy.openModel();

    // 3. Get all documents in the project that are pages, layouts or snippets:
    const documents = myMendixModel.allDocuments().filter((document) => document instanceof pages.Page || document instanceof pages.Layout || document instanceof pages.Snippet);

    // Create a (empty) list of documents that contain a reference to a pluggable widget
    let documentsWithDojoWidgets: { documentType: string; documentName: string; widgetType: string; widgetName: string }[] = [];

    for (const document of documents) {
      // 4. Get JS code that would recreate this document
      const jsOutput = JavaScriptSerializer.serializeToJs(await document.load());

      // 5. Check the serialized document against all regexes
      for (const regex of regexList) {
        const referenceMatch = jsOutput.matchAll(regex.regex);
        // 6. If there is a match, add the document to the list
        for (const match of referenceMatch) {
          const output = match[0];

          // Skip any plugin widgets:
          if (output.includes("pluginWidget = true")) continue;

          // Some additional parsing to get the widget name:
          let widgetName = output.substring(output.indexOf("name = ") + 8).slice(0, -2);
          if (widgetName.includes('"')) widgetName = widgetName.substring(0, widgetName.indexOf('"'));

          // Add the document to the list:
          documentsWithDojoWidgets.push({ documentType: document.structureTypeName, documentName: document.qualifiedName!, widgetType: regex.objectType, widgetName: widgetName });
        }
      }
    }

    // Write the resulting output to a file:
    fs.writeFileSync(`output/${app.name}.json`, JSON.stringify(documentsWithDojoWidgets));
  }
}

// Interface for the regexes
interface RegexMap {
  objectType: string;
  regex: RegExp;
}

// Helper function to transform the JSON list to a list of RegexMaps
function transformList(jsonList: { objectType: string; regex: string }[]): RegexMap[] {
  return jsonList.map((item) => ({
    objectType: item.objectType,
    regex: new RegExp(item.regex, "g"),
  }));
}
