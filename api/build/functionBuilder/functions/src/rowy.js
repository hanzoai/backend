"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const storage_1 = require("./utils/storage");
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
        projectId: async () => process.env.GCLOUD_PROJECT,
        projectNumber: async () => "",
        serviceAccountEmail: async () => `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
        serviceAccountUser: async () => ({
            email: `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
            emailVerified: true,
            displayName: "Default Service Account",
            photoURL: "",
            uid: `serviceAccount:${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
            timestamp: new Date().getTime(),
        }),
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