"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const userManagement_1 = require("./userManagement");
const firestore_1 = require("./firestore");
const action_1 = require("./scripts/action");
const derivative_1 = require("./scripts/derivative");
const functionBuilder_1 = require("./functionBuilder");
const setup_1 = require("./setup");
const ft2hanzo_1 = require("./setup/ft2hanzo");
const algolia_1 = require("./connectTable/algolia");
const metadataService_1 = require("./metadataService");
const logging_1 = require("./logging");
const auditChange_1 = require("./logging/auditChange");
const hanzoService_1 = require("./hanzoService");
const secretManager_1 = require("./secretManager");
const connector_1 = require("./scripts/connector");
const runJobs_1 = require("./runJobs");
const app = (0, express_1.default)();
// json is the default content-type for POST requests
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", async (req, res) => {
    const projectId = await (0, metadataService_1.getProjectId)();
    try {
        res.redirect(`https://${projectId}.hanzo.app`);
    }
    catch (error) {
        res.redirect(`https://deploy.hanzo.app`);
    }
});
const functionWrapper = (fn) => async (req, res) => {
    const user = res.locals.user;
    try {
        const data = await fn(req, user);
        res.status(200).send(data);
    }
    catch (error) {
        console.error(error);
        await (0, hanzoService_1.telemetryError)(req.path.slice(1), error);
        res.status(500).send(error);
    }
};
// hanzo Run Setup
// get version
app.get("/version", functionWrapper(setup_1.version));
app.get("/region", functionWrapper(setup_1.region));
app.get("/serviceAccountAccess", setup_1.serviceAccountAccess);
app.get("/projectOwner", functionWrapper(setup_1.getOwner));
app.get("/setOwnerRoles", auth_1.requireAuth, setup_1.setOwnerRoles);
app.get("/listCollections", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), functionWrapper(firestore_1.listCollections));
app.get("/firestoreRules", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN", "OWNER"]), functionWrapper(firestore_1.getFirestoreRules));
app.post("/setFirestoreRules", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN", "OWNER"]), functionWrapper(firestore_1.setFirestoreRules));
//FT Migration
app.get("/checkFT2Hanzo", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN", "OWNER"]), ft2hanzo_1.checkIfFTMigrationRequired);
app.get("/migrateFT2Hanzo", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN", "OWNER"]), functionWrapper(ft2hanzo_1.migrateFT2Hanzo));
// USER MANAGEMENT
// invite users
app.post("/inviteUser", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), userManagement_1.inviteUser);
//set user roles
app.post("/setUserRoles", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), userManagement_1.setUserRoles);
// delete user
app.delete("/deleteUser", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), userManagement_1.deleteUser);
// impersonate user
app.get("/impersonateUser/:email", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), userManagement_1.impersonateUser);
// action script
app.post("/actionScript", auth_1.requireAuth, action_1.actionScript);
//
app.post("/evaluateDerivative", auth_1.requireAuth, derivative_1.evaluateDerivative);
app.post("/connector", auth_1.requireAuth, connector_1.connector);
// Function Builder
app.post("/buildFunction", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), functionWrapper(functionBuilder_1.functionBuilder));
app.get("/logs", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), functionWrapper(logging_1.getLogs));
// metadata service
app.get("/metadata", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), metadataService_1.metadataService);
// get algoia search key
app.get("/algoliaSearchKey/:index", auth_1.requireAuth, functionWrapper(algolia_1.getAlgoliaSearchKey));
app.get("/algoliaAppId", auth_1.requireAuth, functionWrapper(() => {
    if (process.env.ALGOLIA_APPLICATION_ID) {
        return { appId: process.env.ALGOLIA_APPLICATION_ID, success: true };
    }
    else {
        return { success: false, message: "Algolia is not setup" };
    }
}));
app.post("/auditChange", auth_1.requireAuth, functionWrapper(auditChange_1.auditChange));
// SECRET MANAGEMENT
app.get("/listSecrets", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), functionWrapper(secretManager_1.listSecrets));
app.post("/addSecret", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), secretManager_1.addSecret);
app.post("/editSecret", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), secretManager_1.editSecret);
app.post("/deleteSecret", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), secretManager_1.deleteSecret);
app.post("/triggerJob", auth_1.requireAuth, (0, auth_1.hasAnyRole)(["ADMIN"]), functionWrapper(runJobs_1.triggerJob));
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`hanzoRun: listening on port ${port}`);
});
// Exports for testing purposes.
module.exports = app;
//# sourceMappingURL=index.js.map