"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impersonateUser = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const Collections_1 = require("../constants/Collections");
const impersonateUser = async (req, res) => {
    try {
        const impersonator = res.locals.user;
        const { email } = req.params;
        // check if user exists
        const user = await firebaseConfig_1.auth.getUserByEmail(email);
        const token = await firebaseConfig_1.auth.createCustomToken(user.uid);
        await firebaseConfig_1.db.collection(Collections_1.hanzoUsersImpersonationLogs).add({
            createdAt: new Date(),
            impersonatedUid: user.uid,
            impersonatedUserEmail: email,
            impersonatorUid: impersonator.uid,
            impersonatorEmail: impersonator.email,
        });
        res.send({
            success: true,
            token,
            message: `Authenticating as ${user.displayName}`,
        });
    }
    catch (error) {
        res.send({ error, success: false });
    }
};
exports.impersonateUser = impersonateUser;
//# sourceMappingURL=impersonateUser.js.map