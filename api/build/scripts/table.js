"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableAction = exports.authUser2hanzoUser = void 0;
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
// TODO convert to schema publisher/subscriber
const tableAction = async (req, res) => {
    try {
        const user = res.locals.user;
        const userRoles = user.roles;
        if (!userRoles || userRoles.length === 0)
            throw new Error("User has no assigned roles");
        const { schemaDocPath, actionKey, collectionPath } = req.body;
        const schemaDoc = await firebaseConfig_1.db.doc(schemaDocPath).get();
        const schemaDocData = schemaDoc.data();
        if (!schemaDocData) {
            return res.send({
                success: false,
                message: "no schema found",
            });
        }
        const config = schemaDocData.tableActions[actionKey];
        const { fn } = config;
        const fnBody = fn.replace(/^.*=>/, "");
        const tableAction = eval(`async({db,ref,auth,fetch,hanzo,storage})=>` + fnBody);
        const results = await tableAction({
            ref: collectionPath.type === "collection"
                ? firebaseConfig_1.db.collection(collectionPath.path)
                : firebaseConfig_1.db.collectionGroup(collectionPath.path),
            db: firebaseConfig_1.db,
            auth: firebaseConfig_1.auth,
            fetch: node_fetch_1.default,
            user,
            storage: firebaseConfig_1.storage,
            hanzo: hanzo_1.default,
        });
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
exports.tableAction = tableAction;
//# sourceMappingURL=table.js.map