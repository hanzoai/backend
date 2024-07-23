"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompositeIndex = exports.setFirestoreRules = exports.getFirestoreRules = exports.listCollections = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const firebase_admin_1 = require("firebase-admin");
const listCollections = async (req) => {
    const { path } = req.query;
    if (path) {
        const collections = await firebaseConfig_1.db
            .doc(decodeURIComponent(path))
            .listCollections();
        return collections.map((collection) => collection.id);
    }
    else {
        const collections = await firebaseConfig_1.db.listCollections();
        return collections
            .map((collection) => collection.id)
            .filter((id) => id !== "_hanzo_");
    }
};
exports.listCollections = listCollections;
const getFirestoreRules = async () => {
    const firestoreRules = await (0, firebase_admin_1.securityRules)().getFirestoreRuleset();
    return firestoreRules;
};
exports.getFirestoreRules = getFirestoreRules;
const setFirestoreRules = async (req) => {
    const { ruleset } = req.body;
    console.log(ruleset);
    if (!ruleset)
        throw new Error("No ruleset Provided");
    const resp = await (0, firebase_admin_1.securityRules)().releaseFirestoreRulesetFromSource(ruleset);
    return {
        success: true,
        resp,
        message: "Firestore rules has been successfully updated",
    };
};
exports.setFirestoreRules = setFirestoreRules;
const createCompositeIndex = async (req) => { };
exports.createCompositeIndex = createCompositeIndex;
//# sourceMappingURL=index.js.map