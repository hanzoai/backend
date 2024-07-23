"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteUser = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const Collections_1 = require("../constants/Collections");
const metadataService_1 = require("../metadataService");
const hanzoService_1 = require("../hanzoService");
const getFirebaseAuthUser = async (email) => {
    try {
        return await firebaseConfig_1.auth.getUserByEmail(email);
    }
    catch (error) {
        return false;
    }
};
const inviteUser = async (req, res) => {
    try {
        const inviterUser = res.locals.user;
        const { email, roles } = req.body;
        const projectId = await (0, metadataService_1.getProjectId)();
        // check if user exists
        const userQuery = await firebaseConfig_1.db
            .collection(Collections_1.hanzoUsers)
            .where("email", "==", email)
            .get();
        if (userQuery.docs.length !== 0) {
            throw new Error("User already exists");
        }
        // check if user already exists in firebase
        let user = await getFirebaseAuthUser(email);
        if (!user) {
            // create user
            user = await firebaseConfig_1.auth.createUser({
                email,
            });
        }
        // roles
        const existingCustomClaims = user.customClaims ?? {};
        await firebaseConfig_1.auth.setCustomUserClaims(user.uid, {
            ...existingCustomClaims,
            roles,
        });
        // send email
        const newUser = {
            email,
            uid: user.uid,
            roles,
        };
        const inviter = {
            email: inviterUser.email,
            uid: inviterUser.uid,
            name: inviterUser.name,
        };
        await (0, hanzoService_1.inviteUserService)(projectId, newUser, inviter);
        return res.send({ success: true });
    }
    catch (error) {
        return res.send({ error: error.message });
    }
};
exports.inviteUser = inviteUser;
//# sourceMappingURL=inviteUser.js.map