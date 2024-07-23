"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("../utils"));
const firebaseConfig_1 = require("../firebaseConfig");
const logging_1 = require("../logging");
const initializedDoc = (columns) => {
    return async (snapshot) => columns.reduce(async (acc, column) => {
        const logging = await logging_1.LoggingFactory.createDefaultValueLogging(column.fieldName, snapshot.ref.id, snapshot.ref.path);
        if (snapshot.get(column.fieldName) !== undefined)
            return { ...(await acc) }; // prevents overwriting already initialised values
        if (column.type === "static") {
            return {
                ...(await acc),
                [column.fieldName]: column.value,
            };
        }
        else if (column.type === "null") {
            return { ...(await acc), [column.fieldName]: null };
        }
        else if (column.type === "dynamic") {
            return {
                ...(await acc),
                [column.fieldName]: await column.script.default({
                    row: snapshot.data(),
                    ref: snapshot.ref,
                    db: firebaseConfig_1.db,
                    auth: firebaseConfig_1.auth,
                    storage: firebaseConfig_1.storage,
                    utilFns: utils_1.default,
                    logging,
                }),
            };
        }
        else
            return { ...(await acc) };
    }, {});
};
exports.default = initializedDoc;
//# sourceMappingURL=index.js.map