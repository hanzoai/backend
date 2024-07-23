"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOwnerRoles = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const setOwnerRoles = async (req, res) => {
    try {
        const userManagementDoc = await firebaseConfig_1.db.doc("_hanzo_/userManagement").get();
        const userToken = res.locals.user;
        const user = await firebaseConfig_1.auth.getUser(userToken.uid);
        const ownerEmail = userManagementDoc
            .get("owner.email")
            .toLowerCase();
        if (user.email.toLowerCase() !== ownerEmail)
            return res.send({
                success: false,
                message: "Logged in user is not the owner",
                ownerEmail,
                userEmail: user.email,
            });
        await firebaseConfig_1.auth.setCustomUserClaims(user.uid, {
            ...user.customClaims,
            roles: ["ADMIN", "OWNER"],
        });
        const updatedUser = await firebaseConfig_1.auth.getUser(user.uid);
        return res.send({
            success: true,
            ownerEmail,
            user,
            newClaims: updatedUser.customClaims,
        });
    }
    catch (error) {
        return res.send({ success: false, error: error });
    }
};
exports.setOwnerRoles = setOwnerRoles;
//# sourceMappingURL=setOwnerRoles.js.map