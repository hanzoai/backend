"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPackages = void 0;
const logger_1 = require("../logger");
const terminalUtils_1 = require("../../terminalUtils");
const addPackages = async (packages, user, streamLogger, buildPath) => {
    const packagesString = packages.reduce((acc, currPackage) => {
        return `${acc} ${currPackage.name}@${currPackage.version ?? "latest"}`;
    }, "");
    if (packagesString.trim().length !== 0) {
        const success = await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath};yarn add ${packagesString}`, (0, logger_1.commandErrorHandler)({
            user,
            description: "Error adding packages",
        }, streamLogger));
        return success;
    }
    return true;
};
exports.addPackages = addPackages;
//# sourceMappingURL=terminal.js.map