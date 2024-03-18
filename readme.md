Setup:

1. If you don't have npm or Typescript installed yet, follow the instructions described in section 3 of https://docs.mendix.com/apidocs-mxsdk/mxsdk/setting-up-your-development-environment/#setting. You can ignore the steps before and after.
2. Either download this project or click on 'Use this template' to immediately create your own repository based on this template.
3. Create a folder named 'config' in this project's root folder.
4. In it, put a file named 'config.json' that contains the following JSON snippet:

   {
   "projectid": "{YourProjectIdHere}",
   "mendixtoken": "{YourMendixTokenHere}",
   "branch": "main"
   }

5. Replace {YourProjectIdHere} with the ID of the project you want to use. You can find it in Sprintr under General > Settings.
6. Replace {YourMendixTokenHere} with one you have generated (or create at https://user-settings.mendix.com/link/developersettings)
7. Set the branch that you want to use. The main line for GIT-projects is 'main', for SVN-projects this is 'trunk'.
8. (Optional) Replace the branch name if you don't want to use the main branch of your project
9. From your terminal within the project directory, run the command 'npm i'. This will install all the necessary node modules.

---

Instructions:

This basic project allows you to open a working copy of a Mendix project and more or less do whatever you want with it: analyze, build, automate...
You can use the following npm-commands:

- npm run build: compile (actually: transpile) your TypeScript to JavaScript
- npm run script: execute the JavaScript file index.js that you created using 'build'
- npm run buildandrun: transpile your TS to JS and immediately execute

---

Useful resources:

- All SDK documentation and tutorials by Mendix: https://docs.mendix.com/apidocs-mxsdk/mxsdk/
