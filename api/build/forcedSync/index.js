"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forcedSync = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const hanzoService_1 = require("../hanzoService");
const forcedSync = async (req) => {
    const { functionsDocPath, type, index } = req.body;
    const functionsDoc = await firebaseConfig_1.db.doc(functionsDocPath).get();
    const functionsSnapshot = functionsDoc.data();
    const { collectionType, collectionPath } = functionsSnapshot;
    const config = functionsSnapshot[type][index];
    const collectionRef = collectionType === "collectionGroup"
        ? firebaseConfig_1.db.collectionGroup(collectionPath)
        : firebaseConfig_1.db.collection(collectionPath);
    switch (type) {
        case "extension":
            const extensionResp = await (0, hanzoService_1.getExtension)(type);
            const { extension, dependencies, syncScript } = extensionResp;
            const extensionContext = { db: firebaseConfig_1.db, auth: firebaseConfig_1.auth };
            if (!syncScript)
                throw new Error("No sync script available");
            const requiredFields = config.requiredFields;
            const collectionQuery = await collectionRef.get();
            const collection = collectionQuery.docs;
            // filter only the documents that have the required fields
            const filteredCollection = requiredFields && requiredFields.length !== 0
                ? collection.filter((doc) => {
                    const docFields = Object.keys(doc.data());
                    const missingFields = requiredFields.filter((field) => !docFields.includes(field));
                    return missingFields.length === 0;
                })
                : collection;
            const extensionBodies = await filteredCollection.map((doc) => {
                const row = doc.data();
                const ref = doc.ref;
            });
            const syncScriptResult = await eval(syncScript)(filteredCollection);
            return {
                success: true,
                message: `${collectionType} ${collectionPath} ${type} ${config.label} synced successfully`,
            };
        case "derivative":
            const derivativeScript = "";
        case "defaultValue":
        default:
            return {
                success: false,
                message: `${type} is not a valid type`,
            };
    }
};
exports.forcedSync = forcedSync;
//# sourceMappingURL=index.js.map