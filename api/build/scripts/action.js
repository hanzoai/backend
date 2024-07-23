"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionScript = exports.authUser2hanzoUser = void 0;
const get_1 = __importDefault(require("lodash/get"));
const firebaseConfig_1 = require("../firebaseConfig");
const node_fetch_1 = __importDefault(require("node-fetch"));
const firestore_1 = require("firebase-admin/firestore");
const hanzo_1 = __importDefault(require("./hanzo"));
const utils_1 = require("../utils");
const hanzoService_1 = require("../hanzoService");
const logging_1 = require("../logging");
const utils_2 = require("../functionBuilder/utils");
const missingFieldsReducer = (data) => (acc, curr) => {
    if (data[curr] === undefined) {
        return [...acc, curr];
    }
    else
        return acc;
};
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
const actionScript = async (req, res) => {
    try {
        const functionStartTime = Date.now();
        const user = res.locals.user;
        const userRoles = user.roles;
        if (!userRoles || userRoles.length === 0)
            throw new Error("User has no assigned roles");
        const { refs, ref, actionParams, column, action, schemaDocPath, } = req.body;
        const schemaDoc = await firebaseConfig_1.db.doc(schemaDocPath).get();
        const schemaDocData = schemaDoc.data();
        if (!schemaDocData) {
            return res.send({
                success: false,
                message: "no schema found",
            });
        }
        const config = schemaDocData.columns[column.key].config;
        const { script, requiredRoles, requiredFields, runFn, undoFn } = config;
        const importHeader = `import hanzo from "./hanzo";\n import fetch from "node-fetch";\n`;
        const runFunctionCode = (0, utils_2.transpile)(importHeader, runFn, script, "action");
        const undoFunctionCode = (0, utils_2.transpile)(importHeader, undoFn, (0, get_1.default)(config, "undo.script"), "action");
        if (!requiredRoles || requiredRoles.length === 0) {
            throw Error(`You need to specify at least one role to run this script`);
        }
        if (!requiredRoles.some((role) => userRoles.includes(role))) {
            throw Error(`You don't have the required roles permissions`);
        }
        const codeToRun = action === "undo" ? undoFunctionCode : runFunctionCode;
        const { yarnStartTime, yarnFinishTime, dependenciesString } = await (0, utils_1.installDependenciesIfMissing)(codeToRun, `action ${column.key} in ${ref.path}`);
        const logging = await logging_1.LoggingFactory.createActionLogging(column.key, ref.id, ref.path);
        const _actionScript = eval(codeToRun);
        const getRows = refs
            ? refs.map(async (r) => firebaseConfig_1.db.doc(r.path).get())
            : [firebaseConfig_1.db.doc(ref.path).get()];
        const rowSnapshots = await Promise.all(getRows);
        const tasks = rowSnapshots.map(async (doc) => {
            try {
                const row = doc.data();
                const missingRequiredFields = requiredFields
                    ? requiredFields.reduce(missingFieldsReducer(row), [])
                    : [];
                if (missingRequiredFields.length > 0) {
                    throw new Error(`Missing required fields:${missingRequiredFields.join(", ")}`);
                }
                const result = await _actionScript({
                    row: row,
                    db: firebaseConfig_1.db,
                    auth: firebaseConfig_1.auth,
                    ref: doc.ref,
                    actionParams,
                    user: { ...(0, exports.authUser2hanzoUser)(user), roles: userRoles },
                    fetch: node_fetch_1.default,
                    hanzo: hanzo_1.default,
                    logging,
                    storage: firebaseConfig_1.storage,
                    tableSchema: schemaDocData,
                });
                if (result.success || result.status) {
                    const cellValue = {
                        status: result.status,
                        completedAt: firestore_1.FieldValue.serverTimestamp(),
                        ranBy: user.email,
                    };
                    try {
                        const update = { [column.key]: cellValue };
                        if (schemaDocData?.audit !== false) {
                            update[schemaDocData?.auditFieldUpdatedBy || "_updatedBy"] = (0, exports.authUser2hanzoUser)(user, { updatedField: column.key });
                        }
                        await firebaseConfig_1.db.doc(ref.path).update(update);
                    }
                    catch (error) {
                        // if actionScript code deletes the row, it will throw an error when updating the cell
                        console.log(error);
                    }
                    return {
                        ...result,
                    };
                }
                else
                    return {
                        ...result,
                        success: false,
                        message: result.message,
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
        const results = await Promise.all(tasks);
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
exports.actionScript = actionScript;
//# sourceMappingURL=action.js.map