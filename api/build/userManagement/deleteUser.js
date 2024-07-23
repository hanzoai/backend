"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const Collections_1 = require("../constants/Collections");
const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;
        // check if user exists
        const userQuery = await firebaseConfig_1.db
            .collection(Collections_1.hanzoUsers)
            .where("user.email", "==", email)
            .get();
        if (userQuery.docs.length === 0) {
            throw new Error("User does not exist");
        }
        const userDoc = userQuery.docs[0];
        await userDoc.ref.delete();
        try {
            await firebaseConfig_1.auth.deleteUser(userDoc.id);
        }
        catch (error) {
            console.log(error);
        }
        res.send({ success: true });
    }
    catch (error) {
        res.send({ error: error.message });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=deleteUser.js.map