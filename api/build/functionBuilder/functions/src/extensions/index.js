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
const utils_1 = __importStar(require("../utils"));
const firebaseConfig_1 = require("../firebaseConfig");
const logging_1 = require("../logging");
const extension = (extensionConfig, fieldTypes, tableSchema) => async (change, context) => {
    const beforeData = change.before?.data();
    const afterData = change.after?.data();
    const ref = change.after ? change.after.ref : change.before.ref;
    const triggerType = (0, utils_1.getTriggerType)(change);
    try {
        const { name, type, triggers, requiredFields, trackedFields } = extensionConfig;
        const loggingCondition = await logging_1.LoggingFactory.createExtensionLogging(type, "condition", name, ref.path);
        const loggingFunction = await logging_1.LoggingFactory.createExtensionLogging(type, "function", name, ref.path);
        const extensionContext = {
            row: triggerType === "delete" ? beforeData : afterData,
            ref,
            db: firebaseConfig_1.db,
            auth: firebaseConfig_1.auth,
            change,
            triggerType,
            extensionConfig,
            utilFns: utils_1.default,
            fieldTypes,
            storage: firebaseConfig_1.storage,
            tableSchema,
        };
        const extensionContextCondition = {
            ...extensionContext,
            logging: loggingCondition,
        };
        const extensionContextFunction = {
            ...extensionContext,
            logging: loggingFunction,
        };
        if (!triggers.includes(triggerType))
            return false; //check if trigger type is included in the extension
        if (triggerType === "update" &&
            trackedFields?.length > 0 &&
            !utils_1.default.hasChanged(change)(trackedFields)) {
            console.log("listener fields didn't change");
            return false;
        }
        if (triggerType !== "delete" &&
            requiredFields &&
            requiredFields.length !== 0 &&
            !(0, utils_1.hasRequiredFields)(requiredFields, afterData)) {
            console.log("requiredFields are ", requiredFields, "type is", type);
            return false; // check if it hase required fields for the extension to run
        }
        const dontRun = !(await extensionConfig.conditions.default(extensionContextCondition));
        console.log(`name: "${name}", type: "${type}", dontRun: ${dontRun}`);
        if (dontRun)
            return false;
        const extensionData = await extensionConfig.extensionBody.default(extensionContextFunction);
        console.log(`extensionData: ${JSON.stringify(extensionData)}`);
        const extensionFn = require(`./${type}`).default;
        await extensionFn(extensionData, extensionContext);
        return true;
    }
    catch (err) {
        const { name, type } = extensionConfig;
        console.log(`error in ${name} extension of type ${type}, on ${context.eventType} in Doc ${context.resource.name}`);
        console.error(err);
        return Promise.reject(err);
    }
};
exports.default = extension;
//# sourceMappingURL=index.js.map