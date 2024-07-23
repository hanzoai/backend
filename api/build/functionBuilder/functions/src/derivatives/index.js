"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseConfig_1 = require("../firebaseConfig");
const utils_1 = __importDefault(require("../utils"));
const logging_1 = require("../logging");
const functionConfig_1 = require("../functionConfig");
const derivative = (functionConfig) => async (change) => {
    try {
        const row = change.after?.data();
        const ref = change.after ? change.after.ref : change.before.ref;
        const update = await functionConfig.reduce(async (accUpdates, currDerivative) => {
            const shouldEval = utils_1.default.hasChanged(change)([
                ...currDerivative.listenerFields,
                "_forcedUpdateAt",
            ]);
            if (shouldEval) {
                try {
                    const logging = await logging_1.LoggingFactory.createDerivativeLogging(currDerivative.fieldName, ref.id, ref.path);
                    const newValue = await currDerivative.evaluate.default({
                        row,
                        ref,
                        db: firebaseConfig_1.db,
                        auth: firebaseConfig_1.auth,
                        storage: firebaseConfig_1.storage,
                        utilFns: utils_1.default,
                        logging,
                        tableSchema: functionConfig_1.tableSchema,
                    });
                    if (newValue !== undefined &&
                        newValue !== row[currDerivative.fieldName]) {
                        return {
                            ...(await accUpdates),
                            [currDerivative.fieldName]: newValue,
                        };
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
            return await accUpdates;
        }, {});
        return update;
    }
    catch (error) {
        console.log(`Derivatives Error`, error);
        return {};
    }
};
exports.default = derivative;
//# sourceMappingURL=index.js.map