# Getting Started with TypeScript React

This project was set up with [Create React App](https://github.com/facebook/create-react-app), but then ported to use [Vite](https://vitejs.dev/), which is faster and more actively maintained.

* TypeScript React
* Linting with eslint
* Formatting with prettier
* Testing with Jest and Enzyme
* State management with React Context

## TypeScript React

The starter project layout should look like the following:

```text
web/
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
* `public` contains static assets, including the unauthenticated `signed-out.html` landing page. Keep that page when customizing the app.
* `src` contains the code. `index.tsx` is the entry-point for your file, and is mandatory.

To learn React, check out the [React documentation](https://reactjs.org/).

## Sign-out

Sign-out clears the oauth2-proxy session and redirects to `/signed-out.html`.
Nginx serves that public page without authentication, even without the Vite dev
server. It does not end the user's Entra SSO session; signing in again requires
clicking the page's link. Keep `public/signed-out.html` in the image.

## BFF development and deployment

The standalone Vite server forwards `/api` requests unchanged to the Docker
Compose nginx on port 80. Nginx strips `/api/` before proxying to FastAPI.

Production builds do not emit source maps. Enable them only after CI can upload
them privately and remove them from the public static-hosting artifact.
