"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingFactory = void 0;
const logging_1 = require("@google-cloud/logging");
class LoggingFactory {
    static async createDerivativeLogging(fieldName, rowId, tablePath) {
        const projectId = process.env.GCLOUD_PROJECT;
        return new LoggingDerivative(projectId, fieldName, rowId, "derivative-function", tablePath);
    }
    static async createExtensionLogging(extensionType, extensionSource, extensionName, tablePath) {
        const projectId = process.env.GCLOUD_PROJECT;
        return new LoggingExtension(projectId, extensionType, extensionSource, extensionName, tablePath);
    }
    static async createDefaultValueLogging(fieldName, rowId, tablePath) {
        const projectId = process.env.GCLOUD_PROJECT;
        return new LoggingDefaultValue(projectId, fieldName, rowId, "defaultValue", tablePath);
    }
}
exports.LoggingFactory = LoggingFactory;
class LoggingAbstract {
    constructor(projectId, functionType) {
        this.functionType = functionType;
        this.logging = new logging_1.Logging({ projectId });
    }
    async logWithSeverity(payload, severity) {
        throw new Error("logWithSeverity must be implemented");
    }
    async log(...payload) {
        await this.logWithSeverity(payload, "DEFAULT");
    }
    async warn(...payload) {
        await this.logWithSeverity(payload, "WARNING");
    }
    async error(...payload) {
        await this.logWithSeverity(payload, "ERROR");
    }
}
class LoggingDerivative extends LoggingAbstract {
    constructor(projectId, fieldName, rowId, functionType, tablePath) {
        super(projectId, functionType);
        this.fieldName = fieldName;
        this.rowId = rowId;
        this.tablePath = tablePath;
    }
    async logWithSeverity(payload, severity) {
        const log = this.logging.log(`hanzo-logging`);
        const metadata = {
            severity,
        };
        const payloadSize = JSON.stringify(payload).length;
        const entry = log.entry(metadata, {
            loggingSource: "backend-function",
            functionType: this.functionType,
            fieldName: this.fieldName,
            rowId: this.rowId,
            tablePath: this.tablePath,
            payload: payloadSize > 250000
                ? { v: "payload too large" }
                : payload.length > 1
                    ? payload
                    : payload[0],
        });
        await log.write(entry);
    }
}
class LoggingExtension extends LoggingAbstract {
    constructor(projectId, extensionType, extensionSource, extensionName, tablePath) {
        super(projectId, "extension");
        this.extensionType = extensionType;
        this.extensionSource = extensionSource;
        this.extensionName = extensionName;
        this.tablePath = tablePath;
    }
    async logWithSeverity(payload, severity) {
        const log = this.logging.log(`hanzo-logging`);
        const metadata = {
            severity,
        };
        const payloadSize = JSON.stringify(payload).length;
        const entry = log.entry(metadata, {
            loggingSource: "backend-function",
            functionType: this.functionType,
            extensionType: this.extensionType,
            extensionSource: this.extensionSource,
            extensionName: this.extensionName,
            tablePath: this.tablePath,
            payload: payloadSize > 250000
                ? { v: "payload too large" }
                : payload.length > 1
                    ? payload
                    : payload[0],
        });
        await log.write(entry);
    }
}
class LoggingDefaultValue extends LoggingAbstract {
    constructor(projectId, fieldName, rowId, functionType, tablePath) {
        super(projectId, functionType);
        this.fieldName = fieldName;
        this.rowId = rowId;
        this.tablePath = tablePath;
    }
    async logWithSeverity(payload, severity) {
        const log = this.logging.log(`hanzo-logging`);
        const metadata = {
            severity,
        };
        const payloadSize = JSON.stringify(payload).length;
        const entry = log.entry(metadata, {
            loggingSource: "backend-function",
            functionType: this.functionType,
            fieldName: this.fieldName,
            rowId: this.rowId,
            tablePath: this.tablePath,
            payload: payloadSize > 250000
                ? { v: "payload too large" }
                : payload.length > 1
                    ? payload
                    : payload[0],
        });
        await log.write(entry);
    }
}
//# sourceMappingURL=index.js.map