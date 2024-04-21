# Start dev server or build the project

- `npm run build` to bundling the code into 1 file for faster loading under dist/esbuild
- `npm run build:tsc` to build your typescript Express codes into Javacript under /dist

## Env

PORT=3000
DB_NAME=amazing
DB_USERNAME=<admin username in MongoDB>
DB_PASSWORD=<admin password in MongoDB>
DB_URL=<mongodb+srv://awscluster1.yerzcf1.mongodb.net/amazing?retryWrites=true&w=majority&appName=AwsCluster1>
DB_LOCAL=mongodb://localhost:27017/amazing
JWT_SECRET=<any secret string, recommended 32 characters or more>

## Running API as AWS Lambda or Azura Function

- [Install `serverless` framework](https://www.npmjs.com/package/@codegenie/serverless-express)
- Checkout for more examples of serverless on all programming languages. [Link](https://github.com/serverless/examples)
- `npm install @codegenie/serverless-express`

## Set up libraries

- Install `morgan`: `npm i morgan @types/morgan`
- List of officially [supported middlewares by Express](https://github.com/senchalabs/connect#middleware)
- `npm i validator` `npm i -D @types/validator`

## Typescript Project Setup

- [Typescript Express](https://blog.logrocket.com/how-to-set-up-node-typescript-express/)

```
npm init
npm install --save-dev @types/node @typescript-eslint/eslint-plugin \
@typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-import \
eslint-plugin-prettier prettier ts-node typescript
npm i express dotenv
npm i -D typescript @types/express @types/node
npm i -D nodemon ts-node
```

- Generate `tsconfig.json` through: `npx tsc --init`
- Change `tsconfig.json` to use `"outDir": "./dist"`
- Running server: `npx ts-node src/index.ts`

## Watching for File change

- Install `concurrently` by `npm i -D concurrently`

- Create a `nodeemon.json` to watch for changes:

```
  {
    "watch": ["src"],
    "ext": "ts",
    "exec": "concurrently \"npx tsc --watch\" \"ts-node src/index.ts\""
  }
```

- After installing these dev dependencies, update the scripts in the package.json file as follows:

```
  {
    "scripts": {
      "build": "npx tsc",
      "start": "node dist/index.js",
      "dev": "nodemon src/index.ts"
    }
  }
```

## Testing Express in Javascript mode

- Change `package.json` to use `src/index.js` instead of `index.js`

```
  {
    ...
    "main": "src/index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    ...
  }
```

- `node src/index.js`

## [Eslint and Prettier setup](https://mobisoftinfotech.com/resources/blog/set-up-node-and-express-js-project-from-scratch-with-typescript-eslint-and-prettier/)

- Optional: `npx eslint --init` or directly created .eslintrc.json

## [How to debug your Express app in VSCode](https://brianjenney.medium.com/how-to-debug-your-node-express-app-using-vs-code-6efb40180ba4)

- `Add Configuration` in `launch.json` as a NodeJs program
- start your project in a terminal windows as `npm start`
- Set up break points, and select the nodejs process to debug from VSCode `Run`
