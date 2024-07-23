"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDerivative = exports.authUser2hanzoUser = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const node_fetch_1 = __importDefault(require("node-fetch"));
const hanzo_1 = __importDefault(require("./hanzo"));
const utils_1 = require("../utils");
const hanzoService_1 = require("../hanzoService");
const logging_1 = require("../logging");
const utils_2 = require("../functionBuilder/utils");
const authUser2hanzoUser = (currentUser, data) => {
    const { name, email, uid, email_verified, picture } = currentUser;
    return {
        timestamp: new Date(),
        displayName: name,
        email,
        uid,
        emailVerified: email_verified,
        photoURL: picture,
        ...data,
    };
};
exports.authUser2hanzoUser = authUser2hanzoUser;
const evaluateDerivative = async (req, res) => {
    try {
        const functionStartTime = Date.now();
        const user = res.locals.user;
        const userRoles = user.roles;
        if (!userRoles || userRoles.length === 0)
            throw new Error("User has no assigned roles");
        // only admin can evaluate derivative
        if (!userRoles.includes("ADMIN"))
            throw new Error("Authenticated User is not admin");
        const { refs, ref, schemaDocPath, columnKey, collectionPath } = req.body;
        const schemaDoc = await firebaseConfig_1.db.doc(schemaDocPath).get();
        const schemaDocData = schemaDoc.data();
        if (!schemaDocData) {
            return res.send({
                success: false,
                message: "no schema found",
            });
        }
        const config = schemaDocData.columns[columnKey].config;
        const { derivativeFn, script } = config;
        const importHeader = `import hanzo from "./hanzo";\n import fetch from "node-fetch";`;
        const code = (0, utils_2.transpile)(importHeader, derivativeFn, script, "derivative");
        const { yarnStartTime, yarnFinishTime, dependenciesString } = await (0, utils_1.installDependenciesIfMissing)(code, `derivative ${columnKey} in ${collectionPath}`);
        const logging = await logging_1.LoggingFactory.createDerivativeLogging(columnKey, schemaDoc.ref.id, collectionPath ?? schemaDoc.ref.id);
        const derivativeFunction = eval(code.replace(`"use strict";`, ""));
        let rowSnapshots = [];
        if (collectionPath) {
            rowSnapshots = (await firebaseConfig_1.db.collection(collectionPath).get()).docs;
        }
        else {
            const getRows = refs
                ? refs.map(async (r) => firebaseConfig_1.db.doc(r.path).get())
                : [firebaseConfig_1.db.doc(ref.path).get()];
            rowSnapshots = await Promise.all(getRows);
        }
        const results = [];
        for (let i = 0; i < rowSnapshots.length; i += 300) {
            const chunk = rowSnapshots.slice(i, i + 300);
            const batch = firebaseConfig_1.db.batch();
            const batchResults = chunk.map(async (doc) => {
                try {
                    const row = doc.data();
                    const result = await derivativeFunction({
                        row: row,
                        db: firebaseConfig_1.db,
                        auth: firebaseConfig_1.auth,
                        ref: doc.ref,
                        fetch: node_fetch_1.default,
                        storage: firebaseConfig_1.storage,
                        hanzo: hanzo_1.default,
                        logging,
                        tableSchema: schemaDocData,
                    });
                    const update = { [columnKey]: result };
                    if (schemaDocData?.audit !== false) {
                        update[schemaDocData?.auditFieldUpdatedBy || "_updatedBy"] = (0, exports.authUser2hanzoUser)(user, { updatedField: columnKey });
                    }
                    await batch.update(doc.ref, update);
                    return {
                        success: true,
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error,
                        message: error.message,
                    };
                }
            });
            results.push(...(await Promise.all(batchResults)));
            await batch.commit();
        }
        if (results.length === 1) {
            return res.send(results[0]);
        }
        const functionEndTime = Date.now();
        try {
            await (0, hanzoService_1.telemetryRuntimeDependencyPerformance)({
                functionStartTime,
                functionEndTime,
                yarnStartTime,
                yarnFinishTime,
                dependenciesString,
            });
        }
        catch (e) { }
        return res.send(results);
    }
    catch (error) {
        return res.send({
            success: false,
            error,
            message: error.message,
        });
    }
};
exports.evaluateDerivative = evaluateDerivative;
//# sourceMappingURL=derivative.js.map