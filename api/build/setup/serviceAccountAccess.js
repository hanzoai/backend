"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceAccountAccess = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const firebase_admin_1 = require("firebase-admin");
const serviceAccountAccess = async (req, res) => {
    try {
        const access = {};
        // test access to firestore
        try {
            await firebaseConfig_1.db.listCollections();
            const testDocRef = firebaseConfig_1.db.doc("_hanzo_/testingAccess");
            await testDocRef.set({ success: true });
            const testDoc = await testDocRef.get();
            if (!testDoc.exists)
                access.firestore = false;
            await testDocRef.delete;
            access.firestore = true;
        }
        catch (error) {
            console.log(error);
            access.firestore = false;
        }
        // test access to auth
        try {
            let testUser;
            try {
                testUser = await firebaseConfig_1.auth.createUser({
                    email: "test@test.hanzo",
                });
            }
            catch (error) {
                testUser = await firebaseConfig_1.auth.getUserByEmail("test@test.hanzo");
            }
            await firebaseConfig_1.auth.deleteUser(testUser.uid);
            access.auth = true;
        }
        catch (error) {
            console.log(error);
            access.auth = false;
        }
        // test access to firestore rules
        try {
            await (0, firebase_admin_1.securityRules)().getFirestoreRuleset();
            access.firestoreRules = true;
        }
        catch (error) {
            console.log(error);
            access.firestoreRules = false;
        }
        res.send(access);
    }
    catch (error) {
        res.send({ error });
    }
};
exports.serviceAccountAccess = serviceAccountAccess;
//# sourceMappingURL=serviceAccountAccess.js.map