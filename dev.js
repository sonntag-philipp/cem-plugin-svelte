import fs from "fs";
import ts from "typescript";
import { create } from "@custom-elements-manifest/analyzer/src/create.js";
import sveltePlugin from "./index.js";
import constants from "./const.js";

const defaultFile = fs
  .readFileSync("fixtures/default/sourcecode/default.js")
  .toString();
const appSvelteFile = fs
  .readFileSync("fixtures/default/sourcecode/App.svelte")
  .toString();

const modules = [
  ts.createSourceFile("App.svelte", appSvelteFile, constants.ScriptTarget, true),
  ts.createSourceFile("my-element.js", defaultFile, constants.ScriptTarget, true),
];

console.log(
  JSON.stringify(create({ modules, plugins: [sveltePlugin()] }), null, 2)
);
