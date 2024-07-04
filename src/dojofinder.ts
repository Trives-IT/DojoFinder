import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";
import { JavaScriptSerializer, pages } from "mendixmodelsdk";

const pat = require("../config/pat.json").token as string;
const apps = require("../config/apps.json");

const regexList: RegexMap[] = [
  { objectType: "Reference Selector", regex: /var \w+ = pages\.ReferenceSelector\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Reference Set Selector", regex: /var \w+ = pages\.ReferenceSetSelector\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Input Reference Set Selector", regex: /var \w+ = pages\.InputReferenceSetSelector\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Data Grid", regex: /var \w+ = pages\.DataGrid\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Template Grid", regex: /var \w+ = pages\.TemplateGrid\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Dynamic Image Viewer", regex: /var \w+ = pages\.DynamicImageViewer\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Static Image", regex: /var \w+ = pages\.StaticImageViewer\.create\(model\);\n((.*;.*\n)*)/g },
  { objectType: "Custom Widget", regex: /var \w+ = customwidgets\.CustomWidgetType\.create\(model\);\n((.*;.*\n)*)/g },
];

main().catch(console.error);

async function main() {
  // Prerequisite: Get access to app(s) - this is done by setting the Mendix Platform SDK up with a Personal Access Token (PAT)
  setPlatformConfig({ mendixToken: pat });
  const mxClient = new MendixPlatformClient();

  // Iterate over your list of apps:
  for (const app of apps) {
    // 1. Load a Mendix app:
    console.log(`Opening app ${app.name} with id ${app.id} and branch ${app.branch}`);
    const myMendixApp = mxClient.getApp(app.id);
    const mxWorkingCopy = await myMendixApp.createTemporaryWorkingCopy(app.branch);
    const myMendixModel = await mxWorkingCopy.openModel();
    console.log(`Opened app ${app.name}`);

    // 2. Get all documents that could contain a (Dojo) widget - pages, layouts and snippets
    const documents = myMendixModel.allDocuments().filter((document) => document instanceof pages.Page || document instanceof pages.Layout || document instanceof pages.Snippet);
    console.log(`Found ${documents.length} pages, layouts or snippets in app ${app.name}`);

    // Create an empty list to store the documents with Dojo widgets
    let documentsWithDojoWidgets: { documentType: string; documentName: string; widgetType: string; widgetName: string }[] = [];
    console.log(`Checking all documents for Dojo widgets in app ${app.name}`);
    for (const document of documents) {
      // 3. Get contents of those documents - Get JS code that would recreate this document with SerializeToJs
      const serializedDocument = JavaScriptSerializer.serializeToJs(await document.load());

      // 4. Find the widgets using patterns - Check the generated document against a list of regular expressions
      for (const regex of regexList) {
        const referenceMatch = serializedDocument.matchAll(regex.regex);
        // If there is a match, add the document to the list
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

    console.log(`Found ${documentsWithDojoWidgets.length} outdated widgets in app ${app.name}`);

    // 5. Export results - Write the resulting output to a file:
    fs.writeFileSync(`output/${app.name}.json`, JSON.stringify(documentsWithDojoWidgets));
  }
}

// Interface for the regexes
type RegexMap = {
  objectType: string;
  regex: RegExp;
};
