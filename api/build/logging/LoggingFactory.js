"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingFactory = void 0;
const logging_1 = require("@google-cloud/logging");
const metadataService_1 = require("../metadataService");
class LoggingFactory {
    static async createActionLogging(fieldName, rowId, tablePath) {
        const projectId = await (0, metadataService_1.getProjectId)();
        return new LoggingFieldAndRow(projectId, fieldName, rowId, "action", tablePath);
    }
    static async createConnectorLogging(fieldName, rowId, tablePath) {
        const projectId = await (0, metadataService_1.getProjectId)();
        return new LoggingFieldAndRow(projectId, fieldName, rowId, "connector", tablePath);
    }
    static async createDerivativeLogging(fieldName, rowId, tablePath) {
        const projectId = await (0, metadataService_1.getProjectId)();
        return new LoggingFieldAndRow(projectId, fieldName, rowId, "derivative-script", tablePath);
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
class LoggingFieldAndRow extends LoggingAbstract {
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
            loggingSource: "backend-scripts",
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
//# sourceMappingURL=LoggingFactory.js.map