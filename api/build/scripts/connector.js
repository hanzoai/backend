"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connector = exports.authUser2hanzoUser = void 0;
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
// TODO convert to schema publisher/subscriber
const connector = async (req, res) => {
    try {
        const functionStartTime = Date.now();
        const user = res.locals.user;
        const userRoles = user.roles;
        if (!userRoles || userRoles.length === 0)
            throw new Error("User has no assigned roles");
        const { rowDocPath, query, columnKey, schemaDocPath } = req.body;
        const schemaDoc = await firebaseConfig_1.db.doc(schemaDocPath).get();
        const schemaDocData = schemaDoc.data();
        if (!schemaDocData) {
            return res.send({
                success: false,
                message: "no schema found",
            });
        }
        const config = schemaDocData.columns[columnKey].config;
        const { connectorFn } = config;
        const importHeader = `import hanzo from "./hanzo";\n import fetch from "node-fetch";\n`;
        const connectorFnBody = (0, utils_2.transpile)(importHeader, connectorFn, undefined, "connectorFn");
        const { yarnStartTime, yarnFinishTime, dependenciesString } = await (0, utils_1.installDependenciesIfMissing)(connectorFnBody, `connector ${columnKey} in ${rowDocPath}`);
        const logging = await logging_1.LoggingFactory.createConnectorLogging(columnKey, schemaDoc.ref.id, rowDocPath);
        const connectorScript = eval(connectorFnBody);
        const pattern = /row(?!y)/;
        const functionUsesRow = pattern.test(connectorFnBody);
        const rowSnapshot = functionUsesRow && rowDocPath
            ? (await firebaseConfig_1.db.doc(rowDocPath).get()).data()
            : null;
        const results = await connectorScript({
            row: rowSnapshot,
            ref: rowDocPath ? firebaseConfig_1.db.doc(rowDocPath) : null,
            query,
            db: firebaseConfig_1.db,
            auth: firebaseConfig_1.auth,
            fetch: node_fetch_1.default,
            user,
            storage: firebaseConfig_1.storage,
            hanzo: hanzo_1.default,
            logging,
            tableSchema: schemaDocData,
        });
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
        return res.send({
            success: true,
            hits: results,
        });
    }
    catch (error) {
        return res.send({
            success: false,
            error,
            message: error.message,
        });
    }
};
exports.connector = connector;
//# sourceMappingURL=connector.js.map