"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.auth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const storage_1 = require("firebase-admin/storage");
(0, app_1.initializeApp)();
// Initialize Cloud Firestore Database
exports.db = (0, firestore_1.getFirestore)();
// Initialize Auth
exports.auth = (0, auth_1.getAuth)();
// Initialize Storage
exports.storage = (0, storage_1.getStorage)();
const settings = {
    ignoreUndefinedProperties: true,
};
exports.db.settings(settings);
//# sourceMappingURL=firebaseConfig.js.map