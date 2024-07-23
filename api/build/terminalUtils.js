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
exports.asyncExecute = void 0;
exports.execute = execute;
const child = __importStar(require("child_process"));
function execute(command, callback) {
    console.log(command);
    child.exec(command, function (error, stdout, stderr) {
        console.log({ error, stdout, stderr });
        callback(stdout);
    });
}
const asyncExecute = async (command, callback, logger) => {
    logger?.info(`Executing: ${command}`);
    return new Promise(async (resolve, reject) => {
        child.exec(command, async function (error, stdout, stderr) {
            logger?.info(`stdout: ${JSON.stringify({ error, stdout, stderr })}`);
            await callback?.(error, stdout, stderr);
            resolve(!error);
        });
    });
};
exports.asyncExecute = asyncExecute;
//# sourceMappingURL=terminalUtils.js.map