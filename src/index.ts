import { App, MendixPlatformClient, OnlineWorkingCopy, RepositoryType, setPlatformConfig } from "mendixplatformsdk";
import * as fs from "fs";
import { IModel } from "mendixmodelsdk";

const config = require("../config/config.json");

let mxClient: MendixPlatformClient;

main().catch(console.error);

async function main() {
  // Set up your Mendix Model SDK client:
  setPlatformConfig({ mendixToken: config.mendixtoken });
  mxClient = new MendixPlatformClient();

  // Option 1: Get an existing app:
  const mxApp = getExistingApp(config.projectid);

  // Option 2: Create a new app:
  // const mxApp = await createNewApp("testje", undefined, "git");

  // Create a working copy and open the model:
  const mxWorkingCopy = await mxApp.createTemporaryWorkingCopy(config.branch);
  const mxModel = await mxWorkingCopy.openModel();

  // Do your worst here :-): Some examples:
  console.log(mxApp.appId);
  console.log(mxWorkingCopy.workingCopyId);
  console.log(mxModel.allModules().forEach((module) => console.log(module.name)));

  // Optional, if you want to commit your changes:
  // await mxModel.flushChanges();
  // await mxWorkingCopy.commitToRepository(config.branch);
}

async function createNewApp(name: string, templateId?: string, repositoryType: RepositoryType = "git"): Promise<App> {
  const newApp = await mxClient.createNewApp(name, { templateId: templateId, repositoryType: repositoryType });
  return newApp;
}

function getExistingApp(projectId: string): App {
  return mxClient.getApp(projectId);
}
