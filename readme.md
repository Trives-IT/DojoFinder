Setup:

1. If you don't have npm or Typescript installed yet, follow the instructions described in section 3 of https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment/#setting. You can ignore the steps before and after.
2. Either download this project or click on 'Use this template' to immediately create your own repository based on this template.
3. Create a folder named 'config' in this project's root folder.
4. Copy the files in the folder 'config_preset' to the config folder
5. Create your own PAT at https://user-settings.mendix.com/link/developersettings and provide it in the pat.json file
6. Provide a list of apps that you want to analyze in apps.json. An app's ID can be found in Sprintr under Settings. If you want to analyze a different branch, you can change it here as well. For SVN-projects, use 'trunk' as the default branch name.
7. From your terminal within the project directory, run the command 'npm i'. This will install all the necessary node modules.

---

Instructions:

The command 'npm run dojofinder' will run your analysis immediately in one go. Other commands (clean, only transpile etc.) can be found in package.json.

---

Useful resources:

- All SDK documentation and tutorials by Mendix: https://docs.mendix.com/apidocs-mxsdk/mxsdk/
