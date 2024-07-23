"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceAccountUser = exports.getSecret = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const metadataService_1 = require("../metadataService");
const secrets = new secret_manager_1.SecretManagerServiceClient();
const getSecret = async (name, v = "latest") => {
    const projectId = await (0, metadataService_1.getProjectId)();
    const [version] = await secrets.accessSecretVersion({
        name: `projects/${projectId}/secrets/${name}/versions/${v}`,
    });
    const payload = version.payload?.data?.toString();
    if (payload && payload[0] === "{") {
        return JSON.parse(payload);
    }
    else {
        return payload;
    }
};
exports.getSecret = getSecret;
const getServiceAccountUser = async () => {
    const serviceAccountEmail = await (0, metadataService_1.getServiceAccountEmail)();
    return {
        email: serviceAccountEmail,
        emailVerified: true,
        displayName: "Hanzo Hooks",
        photoURL: "https://github.com/hanzoai/backend/raw/main/icon.png",
        uid: `serviceAccount:` + serviceAccountEmail,
        timestamp: new Date().getTime(),
    };
};
exports.getServiceAccountUser = getServiceAccountUser;
//# sourceMappingURL=utils.js.map