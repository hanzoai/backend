"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSecrets = listSecrets;
exports.addSecret = addSecret;
exports.editSecret = editSecret;
exports.deleteSecret = deleteSecret;
const secret_manager_1 = require("@google-cloud/secret-manager");
const metadataService_1 = require("./metadataService");
const client = new secret_manager_1.SecretManagerServiceClient();
async function listSecrets() {
    const projectId = await (0, metadataService_1.getProjectId)();
    const [secrets] = await client.listSecrets({
        parent: "projects/" + projectId,
    });
    return secrets.map((secret) => {
        return secret.name.split("/").pop();
    });
}
async function addSecret(req, res) {
    const { name, value } = req.body;
    if (!name) {
        return res.status(400).send({
            error: "Missing name",
        });
    }
    else if (!value) {
        return res.status(400).send({
            error: "Missing value",
        });
    }
    const projectId = await (0, metadataService_1.getProjectId)();
    let hasSecret = false;
    try {
        const [existingSecret] = await client.getSecret({
            name: `projects/${projectId}/secrets/${name}`,
        });
        hasSecret = true;
    }
    catch (e) {
        console.log(`secret ${name} does not exist, creating...`, e.name, e.message);
    }
    if (hasSecret) {
        console.log("hasSecret, skipped createSecret");
    }
    else {
        console.log("secrets.createSecret");
        try {
            await client.createSecret({
                parent: `projects/${projectId}`,
                secretId: name,
                secret: {
                    name,
                    replication: {
                        automatic: {},
                    },
                },
            });
        }
        catch (e) {
            console.error("secrets.createSecret error", e);
            return res.status(400).send(e);
        }
    }
    try {
        console.log("secrets.addSecretVersion");
        const [version] = await client.addSecretVersion({
            parent: `projects/${projectId}/secrets/${name}`,
            payload: {
                data: Buffer.from(value, "utf8"),
            },
        });
        console.log("secrets.enableSecretVersion, version:", version.name, JSON.stringify(version));
        await client.enableSecretVersion({
            name: version.name,
        });
    }
    catch (e) {
        console.error("Failed to add/enable secret version", e);
        return res.status(400).send(e);
    }
    return res.status(200).send({
        success: true,
    });
}
async function editSecret(req, res) {
    const { name, value } = req.body;
    if (!name) {
        return res.status(400).send({
            error: "Missing name",
        });
    }
    else if (!value) {
        return res.status(400).send({
            error: "Missing value",
        });
    }
    const projectId = await (0, metadataService_1.getProjectId)();
    let hasSecret = false;
    try {
        const [existingSecret] = await client.getSecret({
            name: `projects/${projectId}/secrets/${name}`,
        });
        hasSecret = true;
    }
    catch (e) {
        console.log("secrets.getSecret:", e.name, e.message);
    }
    if (hasSecret) {
        console.log("hasSecret true");
    }
    else {
        console.log(`Secret ${name} does not exist`);
        return res.status(400).send(`Secret ${name} does not exist`);
    }
    try {
        console.log("secrets.addSecretVersion");
        const [version] = await client.addSecretVersion({
            parent: `projects/${projectId}/secrets/${name}`,
            payload: {
                data: Buffer.from(value, "utf8"),
            },
        });
        console.log("secrets.enableSecretVersion, version:", version.name, JSON.stringify(version));
        await client.enableSecretVersion({
            name: version.name,
        });
    }
    catch (e) {
        console.error("Failed to add/enable secret version", e);
        return res.status(400).send(e);
    }
    return res.status(200).send({
        success: true,
    });
}
async function deleteSecret(req, res) {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send({
            error: "Missing name",
        });
    }
    const projectId = await (0, metadataService_1.getProjectId)();
    let hasSecret = false;
    try {
        const [existingSecret] = await client.getSecret({
            name: `projects/${projectId}/secrets/${name}`,
        });
        hasSecret = true;
    }
    catch (e) {
        console.log("secrets.getSecret:", e.name, e.message);
    }
    if (hasSecret) {
        console.log("hasSecret true");
    }
    else {
        console.log(`Secret ${name} does not exist`);
        throw new Error(`Secret ${name} does not exist`);
    }
    try {
        await client.deleteSecret({
            name: `projects/${projectId}/secrets/${name}`,
        });
    }
    catch (e) {
        console.error("Failed to delete secret", e);
        return res.status(400).send(e);
    }
    return res.status(200).send({
        success: true,
    });
}
//# sourceMappingURL=secretManager.js.map