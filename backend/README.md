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

## Start dev server or build the project:

- `npm run dev`
- `npm run build` to build your typescript Express codes into Javacript under /dist

## Testing Express in Javascript mode:

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
