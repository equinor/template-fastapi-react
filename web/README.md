# Getting Started with TypeScript React

This project was set up with [Create React App](https://github.com/facebook/create-react-app)

* TypeScript React
* Linting with eslint
* Formatting with prettier
* Testing with Jest and Enzyme
* State management with React Context

## TypeScript React

The starter project layout should look like the following:

```text
web/
├─ images.d.ts
├─ node_modules/
├─ public/
├─ src/
│  └─ ...
├─ package.json
├─ tsconfig.json
├─ tsconfig.prod.json
├─ tsconfig.test.json
└─ .eslintrc.js
```

Of note:

* `tsconfig.json` contains TypeScript-specific options for the project.
  * You can also add a `tsconfig.prod.json` and a `tsconfig.test.json` in case you want to make any tweaks to your production builds, or your test builds.
* `.eslintrc.js` stores the settings for linting, [eslint](https://github.com/eslint/eslint).
* `package.json` contains dependencies, as well as some shortcuts for commands we'd like to run for testing, previewing, and deploying the app.
* `public` contains static assets like the HTML page we're planning to deploy to, or images. You can delete any file in this folder apart from `index.html`.
* `src` contains the code. `index.tsx` is the entry-point for your file, and is mandatory.
* `images.d.ts` will tell TypeScript that certain types of image files can be `import`-ed, which create-react-app supports.

To learn React, check out the [React documentation](https://reactjs.org/).
