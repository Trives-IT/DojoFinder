import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";
import { JavaScriptSerializer, pages } from "mendixmodelsdk";

const config = require("../../config/config.json");
const apps = require("../../config/apps.json");

let mxClient: MendixPlatformClient;

main().catch(console.error);

async function main() {
  // Set up your Mendix Model SDK client:
  setPlatformConfig({ mendixToken: config.mendixtoken });
  mxClient = new MendixPlatformClient();
  const app = apps[0];

  // Open the project:
  console.log(`Opening project: ${app.name} with id: ${app.id} and branch: ${app.branch}`);
  const mxApp = mxClient.getApp(app.id);

  // Create a working copy and open the model:
  const mxWorkingCopy = await mxApp.createTemporaryWorkingCopy(app.branch);
  const mxModel = await mxWorkingCopy.openModel();
  const mxDocuments = mxModel.allDocuments();

  // Get the pages:
  const accountEditPage = await mxDocuments.find((document) => document.name === "Account_Edit")?.load()!;
  const pageWithWidgets = await mxDocuments.find((document) => document.name === "ThisPageHasADojoWidget")?.load()!;

  // Write the serialized pages to a file:
  fs.writeFileSync(`output/_serializedPages/accountEditPage.json`, JavaScriptSerializer.serializeToJs(accountEditPage));
  fs.writeFileSync(`output/_serializedPages/widgetsPage.json`, JavaScriptSerializer.serializeToJs(pageWithWidgets));
}
