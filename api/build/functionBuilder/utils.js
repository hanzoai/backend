"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpile = exports.getSchemaPaths = exports.getTriggerPath = exports.getFunctionName = exports.getCollectionPath = exports.getCollectionType = void 0;
exports.hanzoUser = hanzoUser;
const sucrase_1 = require("sucrase");
function hanzoUser(user, data) {
    return {
        displayName: user?.displayName,
        email: user?.email,
        uid: user?.uid,
        emailVerified: user?.emailVerified,
        photoURL: user?.photoURL,
        timestamp: new Date(),
        ...data,
    };
}
const getCollectionType = (pathname) => {
    const [route, path] = pathname.split("/");
    if (route === "table") {
        const decodedPath = decodeURIComponent(path);
        if (decodedPath.includes("/")) {
            return "subCollection";
        }
        else
            return "collection";
    }
    else if (route === "tableGroup")
        return "collectionGroup";
    else
        return null;
};
exports.getCollectionType = getCollectionType;
const getCollectionPath = (collectionType, tablePath, pathname, tables) => {
    switch (collectionType) {
        case "collection":
            return tables.find((t) => t.id === pathname.split("/")[1] && t.tableType === "primaryCollection").collection;
        case "collectionGroup":
            return tables.find((t) => t.id === pathname.split("/")[1] && t.tableType === "collectionGroup").collection;
        case "subCollection":
            //get parent collection path
            return tablePath
                .split("/")
                .map((element, index) => index % 2 === 0 ? element : `{parentDoc${index === 2 ? "" : index}}`)
                .join("/");
        default:
            break;
    }
};
exports.getCollectionPath = getCollectionPath;
const getFunctionName = (collectionType, collectionPath, depth = 1) => {
    switch (collectionType) {
        case "collection":
            return `${collectionPath
                .replace(/-/g, "_")
                .split("/")
                .filter((element, index) => index % 2 === 0)
                .join("_")}`;
        case "collectionGroup":
            return `CG_${collectionPath.replace(/-/g, "_")}_D${depth}`;
        case "subCollection":
            return `SC_${collectionPath
                .split("/")
                .filter((element, index) => index % 2 === 0)
                .join("_")}`;
        default:
            return "";
    }
};
exports.getFunctionName = getFunctionName;
const getTriggerPath = (collectionType, collectionPath, depth = 1) => {
    let triggerPath = "";
    switch (collectionType) {
        case "collection":
        case "subCollection":
            return `${collectionPath}/{docId}`;
        case "collectionGroup":
            triggerPath = "";
            for (let i = 1; i <= depth; i++) {
                triggerPath = triggerPath + `{parentCol${i}}/{parentDoc${i}}/`;
            }
            triggerPath = triggerPath + collectionPath + "/" + "{docId}";
            return triggerPath;
        default:
            return "";
    }
};
exports.getTriggerPath = getTriggerPath;
const getSchemaPaths = ({ collectionType, collectionPath, tables, tableConfigPath, }) => {
    switch (collectionType) {
        case "collectionGroup":
            return [tableConfigPath];
        case "subCollection":
            const [parentCollection, ...other] = collectionPath.split("/");
            const potentialTables = tables.filter((table) => table.collection === parentCollection &&
                table.tableType === "primaryCollection");
            return potentialTables.map((table) => `/_hanzo_/settings/schema/${table.id ?? table.collection}/${other
                .map((element, index) => (index % 2 === 0 ? "subTables" : element))
                .join("/")}`);
        case "collection":
            const collectionTables = tables.filter((table) => table.collection === collectionPath &&
                table.tableType === "primaryCollection");
            return collectionTables.map((table) => `/_hanzo_/settings/schema/${table.id ?? table.collection}`);
        case "subCollection":
        default:
            break;
    }
};
exports.getSchemaPaths = getSchemaPaths;
const transpile = (importHeader, code, backwardsScript, defaultExportName) => {
    if (code) {
        let transpiledCode = (0, sucrase_1.transform)(importHeader + code, {
            transforms: ["typescript", "imports"],
        }).code;
        const defaultExportRegex = /exports\s*?\.\s*?default\s*?=/;
        if (!defaultExportRegex.test(transpiledCode)) {
            transpiledCode += `\nexports.default = ${defaultExportName};`;
        }
        return transpiledCode;
    }
    else {
        return `
    ${importHeader}
    exports.default = async function ${defaultExportName}({
      row,
      db,
      ref,
      auth,
      logging,
      tableSchema,
      utilFns,
      actionParams,
      user,
      storage,
    }) {\n${backwardsScript}\n};`;
    }
};
exports.transpile = transpile;
//# sourceMappingURL=utils.js.map