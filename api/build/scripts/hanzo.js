"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const storage_1 = require("./storage");
const metadataService_1 = require("../metadataService");
const google_auth_library_1 = require("google-auth-library");
async function generateAccessToken() {
    const auth = new google_auth_library_1.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
}
const hanzo = {
    metadata: {
        projectId: metadataService_1.getProjectId,
        projectNumber: metadataService_1.getNumericProjectId,
        serviceAccountEmail: metadataService_1.getServiceAccountEmail,
        serviceAccountUser: utils_1.getServiceAccountUser,
        serviceAccountAccessToken: generateAccessToken,
    },
    secrets: {
        get: utils_1.getSecret,
    },
    storage: {
        upload: {
            url: storage_1.url2storage,
            data: storage_1.data2storage,
        },
    },
};
exports.default = hanzo;
//# sourceMappingURL=hanzo.js.map