"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDerivative = exports.authUser2hanzoUser = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const node_fetch_1 = __importDefault(require("node-fetch"));
const hanzo_1 = __importDefault(require("./hanzo"));
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
        const user = res.locals.user;
        const userRoles = user.roles;
        if (!userRoles || userRoles.length === 0)
            throw new Error("User has no assigned roles");
        const { refs, ref, schemaDocPath, columnKey } = req.body;
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
        const code = derivativeFn ??
            `{
      ${script}
    }`;
        const derivativeFunction = eval(`async({row,db,ref,auth,fetch,hanzo})=>` + code.replace(/^.*=>/, ""));
        const getRows = refs
            ? refs.map(async (r) => firebaseConfig_1.db.doc(r.path).get())
            : [firebaseConfig_1.db.doc(ref.path).get()];
        const rowSnapshots = await Promise.all(getRows);
        const tasks = rowSnapshots.map(async (doc) => {
            try {
                const row = doc.data();
                const result = await derivativeFunction({
                    row: row,
                    db: firebaseConfig_1.db,
                    auth: firebaseConfig_1.auth,
                    ref: doc.ref,
                    fetch: node_fetch_1.default,
                    hanzo: hanzo_1.default,
                });
                const update = { [columnKey]: result };
                if (schemaDocData?.audit !== false) {
                    update[schemaDocData?.auditFieldUpdatedBy || "_updatedBy"] = (0, exports.authUser2hanzoUser)(user, { updatedField: columnKey });
                }
                await firebaseConfig_1.db.doc(ref.path).update(update);
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
        const results = await Promise.all(tasks);
        if (results.length === 1) {
            return res.send(results[0]);
        }
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
//# sourceMappingURL=transform.js.map