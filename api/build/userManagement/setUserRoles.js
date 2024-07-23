"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRoles = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const Collections_1 = require("../constants/Collections");
const setUserRoles = async (req, res) => {
    try {
        const { email, roles } = req.body;
        // check if user exists
        const userQuery = await firebaseConfig_1.db
            .collection(Collections_1.hanzoUsers)
            .where("user.email", "==", email)
            .get();
        if (userQuery.docs.length === 0) {
            throw new Error("User does not exist");
        }
        const uid = userQuery.docs[0].id;
        const existingCustomClaims = (await firebaseConfig_1.auth.getUser(uid))?.customClaims ?? {};
        await Promise.all([
            userQuery.docs[0].ref.update({ roles }),
            firebaseConfig_1.auth.setCustomUserClaims(uid, { ...existingCustomClaims, roles }),
        ]);
        res.send({ success: true });
    }
    catch (error) {
        res.send({ error: error.message });
    }
};
exports.setUserRoles = setUserRoles;
//# sourceMappingURL=setUserRoles.js.map