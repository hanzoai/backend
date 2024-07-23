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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.R = void 0;
const functions = __importStar(require("firebase-functions"));
const derivatives_1 = __importDefault(require("./derivatives"));
const extensions_1 = __importDefault(require("./extensions"));
const config = __importStar(require("./functionConfig"));
const functionConfig = config;
const utils_1 = require("./utils");
const propagates_1 = __importDefault(require("./propagates"));
const initialize_1 = __importDefault(require("./initialize"));
exports.R = {
    [functionConfig.functionName]: functions
        .region(functionConfig.region)
        .runWith(functionConfig.runtimeOptions)
        .firestore.document(functionConfig.triggerPath)
        .onWrite(async (change, context) => {
        const triggerType = (0, utils_1.getTriggerType)(change);
        let promises = [];
        const extensionPromises = functionConfig.extensionsConfig
            .filter((extensionConfig) => extensionConfig.triggers.includes(triggerType))
            .map((extensionConfig) => {
            try {
                (0, extensions_1.default)(extensionConfig, functionConfig.fieldTypes, functionConfig.tableSchema)(change, context);
            }
            catch (err) {
                console.log(`caught error: ${err}`);
            }
        });
        console.log(`#${extensionPromises.length} extensions will be evaluated on ${triggerType} of ${(0, utils_1.changedDocPath)(change)}`);
        promises = extensionPromises;
        const propagatePromise = (0, propagates_1.default)(change, functionConfig.documentSelectConfig, triggerType);
        promises.push(propagatePromise);
        try {
            let docUpdates = {};
            if (triggerType === "update") {
                try {
                    docUpdates = await (0, derivatives_1.default)(functionConfig.derivativesConfig)(change);
                }
                catch (err) {
                    console.log(`caught error: ${err}`);
                }
            }
            else if (triggerType === "create") {
                try {
                    const initialData = await (0, initialize_1.default)(functionConfig.defaultValueConfig)(change.after);
                    const derivativeData = await (0, derivatives_1.default)(functionConfig.derivativesConfig)(change);
                    docUpdates = { ...initialData, ...derivativeData };
                }
                catch (err) {
                    console.log(`caught error: ${err}`);
                }
            }
            if (Object.keys(docUpdates).length !== 0) {
                promises.push(change.after.ref.update(docUpdates));
            }
            await Promise.all(promises);
        }
        catch (err) {
            console.log(`caught error: ${err}`);
        }
    }),
};
//# sourceMappingURL=index.js.map