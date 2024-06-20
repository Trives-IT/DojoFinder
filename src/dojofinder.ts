import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";
import { JavaScriptSerializer, pages } from "mendixmodelsdk";

const config = require("../config/config.json");
const apps = require("../config/apps.json");
const regexes = require("../config/regexes.json");

let mxClient: MendixPlatformClient;

main().catch(console.error);

async function main() {
  // Set up your Mendix Model SDK client:
  setPlatformConfig({ mendixToken: config.mendixtoken });
  mxClient = new MendixPlatformClient();

  const regexList = transformList(regexes);

  // Iterate over your list of projects:
  for (const app of apps) {
    // Open the project:
    console.log(`Opening project: ${app.name} with id: ${app.id} and branch: ${app.branch}`);
    const mxApp = mxClient.getApp(app.id);

    // Create a working copy and open the model:
    const mxWorkingCopy = await mxApp.createTemporaryWorkingCopy(app.branch);
    const mxModel = await mxWorkingCopy.openModel();

    const documents = mxModel.allDocuments();
    let documentsWithReferenceSelector: { documentType: string; documentName: string; widgetType: string; widgetName: string }[] = [];

    for (const document of documents) {
      if (document instanceof pages.Page || document instanceof pages.Layout || document instanceof pages.Snippet) {
        const loadedDocument = await document.load();
        const jsOutput = JavaScriptSerializer.serializeToJs(loadedDocument);

        for (const regex of regexList) {
          const referenceMatch = jsOutput.matchAll(regex.regex);
          for (const match of referenceMatch) {
            const output = match[0];
            let widgetName = output.substring(output.indexOf("name = ") + 8).slice(0, -2); // TODOWS: Deze moet nog aangescherpt voor de DoJo Widgets
            if (widgetName.includes('"')) widgetName = widgetName.substring(0, widgetName.indexOf('"'));
            documentsWithReferenceSelector.push({ documentType: document.structureTypeName, documentName: document.qualifiedName!, widgetType: regex.objectType, widgetName: widgetName });
          }
        }
      }
    }

    // Write the output to a file:
    fs.writeFileSync(`output/${app.name}.json`, JSON.stringify(documentsWithReferenceSelector));
  }
}

interface RegexMap {
  objectType: string;
  regex: RegExp;
}

function transformList(jsonList: { objectType: string; regex: string }[]): RegexMap[] {
  return jsonList.map((item) => ({
    objectType: item.objectType,
    regex: new RegExp(item.regex, "g"),
  }));
}
