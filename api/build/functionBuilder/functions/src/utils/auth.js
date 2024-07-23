"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyRole = void 0;
const hasAnyRole = (authorizedRoles, context) => {
    if (!context.auth || !context.auth.token.roles)
        return false;
    const userRoles = context.auth.token.roles;
    const authorization = authorizedRoles.reduce((authorized, role) => {
        if (userRoles.includes(role))
            return true;
        else
            return authorized;
    }, false);
    return authorization;
};
exports.hasAnyRole = hasAnyRole;
//# sourceMappingURL=auth.js.map