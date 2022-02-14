import { JSDOM } from "jsdom";
import constants from "./const.js";

/**
 * -- Type Definitions --
 */

/**
 * @typedef ModuleDocument
 * @type {object}
 * @property {string} name
 * @property {string} path
 * @property {Array} declarations
 * @property {Array} exports
 * @property {Array} imports
 */

/**
 * @typedef AnalyzePhaseParameters
 * @type {object}
 * @property {import("typescript")} ts
 * @property {import("typescript").Node} node
 * @property {ModuleDocument} moduleDoc
 * @property {any} context
 */

/**
 * @typedef CollectPhaseParameters
 * @type {object}
 * @property {import("typescript")} ts
 * @property {import("typescript").Node} node
 * @property {any} context
 */

/**
 * @typedef ModuleLinkPhaseParameters
 * @type {object}
 * @property {ModuleDocument} moduleDoc
 * @property {any} context
 */

/**
 * @typedef ModuleLinkPhaseParameters
 * @type {object}
 * @property {any} context
 * @property {any} customElementsManifest
 */


export default function sveltePlugin() {
  return {
    name: "svelte-plugin",
    /**
     * Runs for all modules in a project, before continuing to the `analyzePhase`
     * @param {CollectPhaseParameters} param0 
     */
    collectPhase({ ts, node, context }) {},

    /**
     * Runs for each module
     * @param {AnalyzePhaseParameters} param0 
     */
    analyzePhase({ ts, node, moduleDoc, context }) {
      // You can use this phase to access a module's AST nodes and mutate the custom-elements-manifest.

      if (node.fileName?.endsWith(".svelte")) {
        
        // Get the content of the script element that should be added to the component
        const scriptContent = getScriptContent(node);

        // Create a new script file, as svelte script files (may be) not valid for the typescript compiler.
        const scriptFile = createSourceFile(node.getSourceFile().fileName, scriptContent, ts);

        // Extract all exported statements to get the attributes of the component.
        const exportedStatements = extractExportedStatements(scriptFile, ts);
      }
    },

    /**
     * Runs for each module, after analyzing, all information about your module should now be available
     * @param {ModuleLinkPhaseParameters} param0 
     */
    moduleLinkPhase({ moduleDoc, context }) {},

    /**
     * Runs after modules have been parsed and after post-processing
     * @param {ModuleLinkPhaseParameters} param0 
     */
    packageLinkPhase({ customElementsManifest, context }) {},
  };
}

/**
 * Creates a new source file from the given parameters.
 * @param {string} fileName
 * @param {string} content
 * @param {import("typescript")} ts
 * @returns {import("typescript").SourceFile}
 */
function createSourceFile(fileName, content, ts) {
  return ts.createSourceFile(
    fileName,
    content,
    constants.ScriptTarget,
    true
  );
}

/**
 * Locates the script tag inside the node, extracts it's content and returns it.
 * @param {import("typescript").Node} node
 * @returns {string}
 */
function getScriptContent(node) {
  if (!node.getText().trim()) {
    // When the node has no text content, there's no script content - So 
    // we just return an empty string.
    return "";
  }

  const jsDOM = new JSDOM(node.text);
  const domDocument = jsDOM?.window?.document;

  if (!domDocument) {
    throw new Error("Error while parsing the DOM to get script content.");
  }

  // Get all possible script elements of the Svelte component
  // Docs: https://svelte.dev/docs#component-format-script-context-module
  let returnScript = "";
  for (const scriptElement of domDocument.querySelectorAll("script")) {
    returnScript += scriptElement.textContent;
  }

  return returnScript;
}

/**
 * Extracts the export statements of a source file and maps them into an array.
 * @param {{import("typescript").SourceFile}} sourceFile
 * @param {import("typescript")} ts
 * @returns {[import("typescript").Statement]}
 */
function extractExportedStatements(sourceFile, ts) {
  return sourceFile.statements.filter((statement) => {
    return statement.modifiers[0]?.kind === ts.SyntaxKind.ExportKeyword;
  });
}
