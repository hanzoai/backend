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
exports.rowReducer = exports.changedDocPath = exports.getTriggerType = exports.hasRequiredFields = exports.getSecret = exports.serverTimestamp = void 0;
exports.generateId = generateId;
exports.asyncForEach = asyncForEach;
const admin = __importStar(require("firebase-admin"));
const _ = __importStar(require("lodash"));
exports.serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
const email_1 = require("./email");
const auth_1 = require("./auth");
const secret_manager_1 = require("@google-cloud/secret-manager");
const secrets = new secret_manager_1.SecretManagerServiceClient();
const getSecret = async (name, v = "latest") => {
    const [version] = await secrets.accessSecretVersion({
        name: `projects/${process.env.GCLOUD_PROJECT}/secrets/${name}/versions/${v}`,
    });
    const payload = version.payload?.data?.toString();
    if (payload && payload[0] === "{") {
        return JSON.parse(payload);
    }
    else {
        return payload;
    }
};
exports.getSecret = getSecret;
const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function generateId(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const hasRequiredFields = (requiredFields, data) => requiredFields.reduce((acc, currField) => {
    const v = _.get(data, currField);
    if (v === undefined || v === null)
        return false;
    else
        return acc;
}, true);
exports.hasRequiredFields = hasRequiredFields;
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const getTriggerType = (change) => Boolean(change.after.data()) && Boolean(change.before.data())
    ? "update"
    : Boolean(change.after.data())
        ? "create"
        : "delete";
exports.getTriggerType = getTriggerType;
const changedDocPath = (change) => change.before?.ref.path ?? change.after.ref.path;
exports.changedDocPath = changedDocPath;
const rowReducer = (fieldsToSync, row) => fieldsToSync.reduce((acc, curr) => {
    if (row[curr] !== undefined && row[curr] !== null)
        return { ...acc, [curr]: row[curr] };
    else
        return acc;
}, {});
exports.rowReducer = rowReducer;
const hasChanged = (change) => (trackedFields) => {
    const before = change.before?.data();
    const after = change.after?.data();
    if (!before && after)
        return true;
    else if (before && !after)
        return false;
    else
        return trackedFields.some((trackedField) => JSON.stringify(_.get(before, trackedField)) !==
            JSON.stringify(_.get(after, trackedField)));
};
exports.default = {
    hasChanged,
    getSecret: exports.getSecret,
    hasRequiredFields: exports.hasRequiredFields,
    generateId,
    sendEmail: email_1.sendEmail,
    serverTimestamp: exports.serverTimestamp,
    hasAnyRole: auth_1.hasAnyRole,
    asyncForEach,
};
//# sourceMappingURL=index.js.map