"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerJob = void 0;
const axios_1 = __importDefault(require("axios"));
const metadataService_1 = require("../metadataService");
const triggerJob = async (req) => {
    const { jobName, region } = req.body;
    try {
        const projectId = await (0, metadataService_1.getProjectId)();
        // fetch access token https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances#applications
        const tokenRes = await (0, axios_1.default)(`http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`, {
            method: "get",
            headers: {
                "Metadata-Flavor": `Google`,
            },
        });
        console.log(`tokenRes status ${tokenRes.status} ${tokenRes.statusText} ${tokenRes.data.token_type} ${tokenRes.data.access_token}`);
        console.log(JSON.stringify(tokenRes.data));
        const res = await (0, axios_1.default)(`https://${region ?? "us-central1"}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${projectId}/jobs/${jobName}:run`, {
            method: "post",
            headers: {
                Authorization: `${tokenRes.data.token_type} ${tokenRes.data.access_token}`,
            },
        });
        console.log(`status ${res.status} ${res.statusText}`);
        return {
            success: 200 <= res.status && res.status < 300,
            message: `status ${res.status} ${res.statusText}`,
        };
    }
    catch (e) {
        console.error("Error triggering job", e);
        return {
            success: false,
            error: e.message,
        };
    }
};
exports.triggerJob = triggerJob;
//# sourceMappingURL=index.js.map