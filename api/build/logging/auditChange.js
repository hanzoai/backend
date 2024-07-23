"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditChange = void 0;
const logging_1 = require("@google-cloud/logging");
const metadataService_1 = require("../metadataService");
const auditChange = async (req, user) => {
    const { hanzoUser } = req.body;
    if (user.uid !== hanzoUser.uid)
        throw new Error("401");
    const projectId = await (0, metadataService_1.getProjectId)();
    const logging = new logging_1.Logging({ projectId });
    // Selects the log to write to
    const log = logging.log(`hanzo-audit`);
    // The data to write to the log
    // The metadata associated with the entry
    const metadata = {
        resource: {
            type: "global",
        },
        severity: "DEFAULT",
    };
    // Prepares a log entry
    const entry = log.entry(metadata, req.body);
    return log.write(entry);
};
exports.auditChange = auditChange;
//# sourceMappingURL=auditChange.js.map