import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";

const config = require("../../config/config.json");
const apps = require("../../config/apps.json");

let mxClient: MendixPlatformClient;

main().catch(console.error);

async function main() {
  // Set up your Mendix Model SDK client:
  setPlatformConfig({ mendixToken: config.mendixtoken });
  mxClient = new MendixPlatformClient();
  const app = apps[0];
  // Iterate over your list of projects:

  // Open the project:
  console.log(`Opening project: ${app.name} with id: ${app.id} and branch: ${app.branch}`);
  const mxApp = mxClient.getApp(app.id);

  // Create a working copy and open the model:
  const mxWorkingCopy = await mxApp.createTemporaryWorkingCopy(app.branch);
  const mxModel = await mxWorkingCopy.openModel();
  const mxDocuments = mxModel.allDocuments();

  const allDocuments: { documentName: string; documentType: string }[] = [];

  for (const mxDocument of mxDocuments) {
    allDocuments.push({ documentName: mxDocument.name, documentType: mxDocument.structureTypeName });
  }

  // Write the output to a file:
  fs.writeFileSync(`output/_documentlist/documentlist.json`, JSON.stringify(allDocuments));
}
