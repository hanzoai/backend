"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyRole = exports.requireAuth = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const hanzoService_1 = require("../hanzoService");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader)
            return res.status(401).send("Unauthorized");
        const authToken = authHeader.split(" ")[1];
        const decodedToken = await firebaseConfig_1.auth.verifyIdToken(authToken);
        res.locals.user = decodedToken;
        (0, hanzoService_1.telemetry)(req.path.slice(1));
        next();
    }
    catch (error) {
        await (0, hanzoService_1.telemetryError)(req.path.slice(1), error);
        res.sendStatus(401);
    }
};
exports.requireAuth = requireAuth;
const hasAnyRole = (roles) => async (req, res, next) => {
    const user = res.locals.user;
    try {
        const userRoles = user.roles;
        // user roles must have at least one of the roles
        const authorized = roles.some((role) => userRoles.includes(role));
        if (authorized) {
            next();
        }
        else {
            const latestUser = await firebaseConfig_1.auth.getUser(user.uid);
            const authDoubleCheck = roles.some((role) => latestUser.customClaims.roles.includes(role));
            if (authDoubleCheck) {
                next();
            }
            else {
                res.status(401).send({
                    error: "Unauthorized",
                    message: "User does not have any of the required roles",
                    roles,
                });
            }
        }
    }
    catch (error) {
        await (0, hanzoService_1.telemetryError)(req.path.slice(1), error);
        res.status(401);
    }
};
exports.hasAnyRole = hasAnyRole;
//# sourceMappingURL=auth.js.map