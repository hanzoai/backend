"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionLib = void 0;
const logger_1 = require("../logger");
const terminal_1 = require("./terminal");
const terminalUtils_1 = require("../../terminalUtils");
const hanzoService_1 = require("../../hanzoService");
const addExtensionLib = async (name, user, streamLogger, buildPath, buildFolderTimestamp) => {
    try {
        const extensionResp = await (0, hanzoService_1.getExtension)(name);
        const { extension, dependencies } = extensionResp;
        const packages = Object.keys(dependencies).map((key) => ({
            name: key,
            version: dependencies[key],
        }));
        const success = await (0, terminal_1.addPackages)(packages, user, streamLogger, buildPath);
        if (!success) {
            return false;
        }
        const fs = require("fs");
        const path = require("path");
        fs.writeFileSync(path.resolve(__dirname, `../builds/${buildFolderTimestamp}/src/extensions/${name}.ts`), extension);
        await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath}/src/extensions;tsc ${name}.ts`, (0, logger_1.commandErrorHandler)({
            user,
            description: "Error compiling extensionsLib",
        }, streamLogger));
    }
    catch (error) {
        console.log(error);
        (0, logger_1.logErrorToDB)({
            user,
            errorDescription: `Error installing extension ${name}`,
        }, streamLogger);
        return false;
    }
    return true;
};
exports.addExtensionLib = addExtensionLib;
//# sourceMappingURL=extensions.js.map