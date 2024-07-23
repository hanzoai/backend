import admin from "firebase-admin";
import { transform as sucraseTransform } from "sucrase";

export function hanzoUser(
  user: admin.auth.UserRecord,
  data?: Record<string, any>
) {
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

export const getCollectionType = (pathname: string) => {
  const [route, path] = pathname.split("/");
  if (route === "table") {
    const decodedPath = decodeURIComponent(path);
    if (decodedPath.includes("/")) {
      return "subCollection";
    } else return "collection";
  } else if (route === "tableGroup") return "collectionGroup";
  else return null;
};

export const getCollectionPath = (
  collectionType,
  tablePath,
  pathname,
  tables
) => {
  switch (collectionType) {
    case "collection":
      return tables.find(
        (t: any) =>
          t.id === pathname.split("/")[1] && t.tableType === "primaryCollection"
      ).collection;
    case "collectionGroup":
      return tables.find(
        (t: any) =>
          t.id === pathname.split("/")[1] && t.tableType === "collectionGroup"
      ).collection;
    case "subCollection":
      //get parent collection path
      return tablePath
        .split("/")
        .map((element, index) =>
          index % 2 === 0 ? element : `{parentDoc${index === 2 ? "" : index}}`
        )
        .join("/");
    default:
      break;
  }
};

export const getFunctionName = (
  collectionType: string,
  collectionPath: string,
  depth: number = 1
) => {
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
export const getTriggerPath = (
  collectionType: string,
  collectionPath: string,
  depth: number = 1
) => {
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

export const getSchemaPaths = ({
  collectionType,
  collectionPath,
  tables,
  tableConfigPath,
}) => {
  switch (collectionType) {
    case "collectionGroup":
      return [tableConfigPath];
    case "subCollection":
      const [parentCollection, ...other] = collectionPath.split("/");
      const potentialTables = tables.filter(
        (table: any) =>
          table.collection === parentCollection &&
          table.tableType === "primaryCollection"
      );
      return potentialTables.map(
        (table: any) =>
          `/_hanzo_/settings/schema/${table.id ?? table.collection}/${other
            .map((element, index) => (index % 2 === 0 ? "subTables" : element))
            .join("/")}`
      );
    case "collection":
      const collectionTables = tables.filter(
        (table: any) =>
          table.collection === collectionPath &&
          table.tableType === "primaryCollection"
      );
      return collectionTables.map(
        (table: any) =>
          `/_hanzo_/settings/schema/${table.id ?? table.collection}`
      );
    case "subCollection":
    default:
      break;
  }
};

export const transpile = (
  importHeader: string,
  code: string | undefined,
  backwardsScript: string | undefined,
  defaultExportName: string
) => {
  if (code) {
    let transpiledCode = sucraseTransform(importHeader + code, {
      transforms: ["typescript", "imports"],
    }).code;

    const defaultExportRegex = /exports\s*?\.\s*?default\s*?=/;
    if (!defaultExportRegex.test(transpiledCode)) {
      transpiledCode += `\nexports.default = ${defaultExportName};`;
    }

    return transpiledCode;
  } else {
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
