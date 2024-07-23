"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertErrorToStreamer = insertErrorToStreamer;
exports.commandErrorHandler = commandErrorHandler;
exports.logErrorToDB = logErrorToDB;
exports.createStreamLogger = createStreamLogger;
const firebaseConfig_1 = require("../firebaseConfig");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const utils_1 = require("./utils");
async function insertErrorToStreamer(errorRecord, streamLogger) {
    let errorString = "";
    for (const key of [
        "command",
        "description",
        "functionConfigTs",
        "sparksConfig",
        "stderr",
        "errorStackTrace",
    ]) {
        const value = errorRecord[key];
        if (value) {
            errorString += `\n\n${key}: ${value}`;
        }
    }
    await streamLogger.error(errorString);
}
function commandErrorHandler(meta, streamLogger) {
    return async function (error, stdout, stderr) {
        await streamLogger.info(stdout);
        if (!error) {
            return;
        }
        const errorRecord = {
            errorType: "commandError",
            ranBy: (0, utils_1.hanzoUser)(meta.user),
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            stdout: stdout ?? "",
            stderr: stderr ?? "",
            errorStackTrace: error?.stack ?? "",
            command: error?.cmd ?? "",
            description: meta?.description ?? "",
            functionConfigTs: meta?.functionConfigTs ?? "",
            sparksConfig: meta?.sparksConfig ?? "",
        };
        await insertErrorToStreamer(errorRecord, streamLogger);
    };
}
async function logErrorToDB(data, streamLogger) {
    console.error(data.errorDescription);
    const errorRecord = {
        errorType: "codeError",
        ranBy: (0, utils_1.hanzoUser)(data.user),
        description: data.errorDescription,
        createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        sparksConfig: data?.sparksConfig ?? "",
        errorExtraInfo: data?.errorExtraInfo ?? "",
        errorStackTrace: data?.errorTraceStack ?? "",
    };
    if (streamLogger) {
        await insertErrorToStreamer(errorRecord, streamLogger);
    }
}
async function createStreamLogger(tableConfigPath) {
    const startTimeStamp = Date.now();
    const fullLog = [];
    const logRef = firebaseConfig_1.db
        .doc(tableConfigPath)
        .collection("buildLogs")
        .doc(startTimeStamp.toString());
    await logRef.set({ startTimeStamp, status: "BUILDING" });
    console.log(`streamLogger created. tableConfigPath: ${tableConfigPath}, startTimeStamp: ${startTimeStamp}`);
    return {
        info: async (log) => {
            console.log(log);
            fullLog.push({
                log,
                level: "info",
                timestamp: Date.now(),
            });
            await logRef.update({
                fullLog,
            });
        },
        error: async (log) => {
            console.error(log);
            fullLog.push({
                log,
                level: "error",
                timestamp: Date.now(),
            });
            await logRef.update({
                fullLog,
            });
        },
        end: async () => {
            const logsDoc = await logRef.get();
            const errorLog = logsDoc
                .get("fullLog")
                .filter((log) => log.level === "error");
            if (errorLog.length !== 0) {
                console.log("streamLogger marked as FAIL");
                await logRef.update({
                    status: "FAIL",
                    failTimeStamp: Date.now(),
                });
            }
            else {
                console.log("streamLogger marked as SUCCESS");
                await logRef.update({
                    status: "SUCCESS",
                    successTimeStamp: Date.now(),
                });
            }
        },
        fail: async () => {
            console.log("streamLogger marked as FAIL");
            await logRef.update({
                status: "FAIL",
                failTimeStamp: Date.now(),
            });
        },
    };
}
//# sourceMappingURL=logger.js.map