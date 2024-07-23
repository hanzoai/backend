"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialiseDocumentSelectColumns = exports.serialiseDefaultValueColumns = exports.serialiseDerivativeColumns = exports.serialiseExtension = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../../../utils");
const utils_2 = require("../../utils");
const headerImports = `import hanzo from '../hanzo';\n import fetch from 'node-fetch';\n`;
const removeInlineVersioning = (code) => code.replace(/(?:require\(.*)@\d+\.\d+\.\d+/g, (capture) => capture.split("@")[0]);
const removeTrailingColon = (code) => {
    return code.replace(/\s*;\s*$/, "");
};
/* Convert extension objects into a single readable string */
const serialiseExtension = (extensions, buildFolderTimestamp) => "[" +
    extensions
        .filter((extension) => extension.active)
        .map((extension, i) => {
        const extensionBody = (0, utils_2.transpile)(headerImports, removeInlineVersioning(extension.extensionBody), "", "extensionBody");
        // Write the derivative function to a file.
        fs.writeFileSync(path.resolve(__dirname, `../../builds/${buildFolderTimestamp}/src/extensions/${extension.name}_${i}_extensionBody.js`), extensionBody);
        const conditions = (0, utils_2.transpile)(headerImports, removeInlineVersioning(extension.conditions), "", "condition");
        fs.writeFileSync(path.resolve(__dirname, `../../builds/${buildFolderTimestamp}/src/extensions/${extension.name}_${i}_conditions.js`), conditions);
        return `{
          name: "${extension.name}",
          type: "${extension.type}",
          triggers: [${extension.triggers
            .map((trigger) => `"${trigger}"`)
            .join(", ")}],
          requiredFields: [${extension.requiredFields
            ?.map((field) => `"${field}"`)
            .join(", ")}],
            trackedFields: [${extension.trackedFields
            ?.map((field) => `"${field}"`)
            .join(", ")}],
          \/\/ extensionBody:require("./extensions/${extension.name}_${i}_extensionBody"),
          \/\/ conditions:require("./extensions/${extension.name}_${i}_conditions"),
          requiredPackages:${JSON.stringify((0, utils_1.getRequiredPackages)(extension.extensionBody))}
        }`;
    })
        .join(",") +
    "]";
exports.serialiseExtension = serialiseExtension;
/* convert derivative columns into a readable string */
const serialiseDerivativeColumns = (derivativeColumns, buildFolderTimestamp) => `[${derivativeColumns.reduce((acc, currColumn) => {
    const { derivativeFn, script, listenerFields } = currColumn.config;
    if (listenerFields.includes(currColumn.key)) {
        throw new Error(`${currColumn.key} derivative has its own key as a listener field`);
    }
    const functionBody = (0, utils_2.transpile)(headerImports, derivativeFn, script, "derivative");
    // Write the derivative function to a file.
    fs.writeFileSync(path.resolve(__dirname, `../../builds/${buildFolderTimestamp}/src/derivatives/${currColumn.key}.js`), functionBody);
    return `${acc}{\nfieldName:'${currColumn.key}'
    ,requiredPackages:${JSON.stringify((0, utils_1.getRequiredPackages)(functionBody))},
    \/\/ evaluate:require("./derivatives/${currColumn.key}"),
    \nlistenerFields:[${listenerFields
        .map((fieldKey) => `"${fieldKey}"`)
        .join(",\n")}]},\n`;
}, "")}]`;
exports.serialiseDerivativeColumns = serialiseDerivativeColumns;
const serialiseDefaultValueColumns = (defaultValueColumns, buildFolderTimestamp) => `[${defaultValueColumns.reduce((acc, currColumn) => {
    const { dynamicValueFn, script, type, value } = currColumn.config.defaultValue;
    if (type === "static") {
        return `${acc}{\nfieldName:'${currColumn.key}',
    type:"${type}",
    value:${typeof value === "string"
            ? `"${value.replace(/"/g, `\\"`)}"`
            : JSON.stringify(value)},
   },\n`;
    }
    else if (type === "dynamic") {
        const functionBody = (0, utils_2.transpile)(headerImports, dynamicValueFn, script, "dynamicValueFn");
        const dir = path.resolve(__dirname, `../../builds/${buildFolderTimestamp}/src/initialize`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Write the dynamic value function to a file.
        fs.writeFileSync(path.resolve(__dirname, `../../builds/${buildFolderTimestamp}/src/initialize/${currColumn.key}.js`), removeInlineVersioning(functionBody));
        return `${acc}{\nfieldName:'${currColumn.key}',
    type:"${type}",
    \/\/ script:require("./initialize/${currColumn.key}"),
    requiredPackages:${JSON.stringify((0, utils_1.getRequiredPackages)(functionBody))},
   },\n`;
    }
    else {
        return `${acc}{\nfieldName:'${currColumn.key}',
    type:"${type}"
   },\n`;
    }
}, "")}]`;
exports.serialiseDefaultValueColumns = serialiseDefaultValueColumns;
const serialiseDocumentSelectColumns = (documentSelectColumns) => `[${documentSelectColumns.reduce((acc, currColumn) => {
    return `${acc}{\nfieldName:'${currColumn.key}',\ntrackedFields:[${currColumn.config.trackedFields
        .map((fieldKey) => `"${fieldKey}"`)
        .join(",\n")}]},\n`;
}, "")}]`;
exports.serialiseDocumentSelectColumns = serialiseDocumentSelectColumns;
//# sourceMappingURL=serialisers.js.map