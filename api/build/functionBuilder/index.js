"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionBuilder = void 0;
const terminalUtils_1 = require("../terminalUtils");
const utils_1 = require("./utils");
const compiler_1 = __importDefault(require("./compiler"));
const logger_1 = require("./logger");
const metadataService_1 = require("../metadataService");
const firebaseConfig_1 = require("../firebaseConfig");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const functionBuilder = async (req, user) => {
    try {
        const { tablePath, tableConfigPath } = req.body;
        const pathname = req.body.pathname.substring(1);
        if (!pathname || !tablePath)
            return { success: false, message: `missing pathname or tablePath` };
        // get settings Document
        const settings = await firebaseConfig_1.db.doc(`_hanzo_/settings`).get();
        const tables = settings.get("tables");
        const collectionType = (0, utils_1.getCollectionType)(pathname);
        const collectionPath = (0, utils_1.getCollectionPath)(collectionType, tablePath, pathname, tables);
        const table = tables.find((t) => t.collection === tablePath);
        const functionName = (0, utils_1.getFunctionName)(collectionType, collectionPath, table?.triggerDepth);
        const functionConfigPath = `_hanzo_/settings/functions/${functionName}`;
        const streamLogger = await (0, logger_1.createStreamLogger)(functionConfigPath);
        await streamLogger.info(`Build started. collectionType: ${collectionType}, tablePath: ${tablePath}, pathname: ${pathname}, functionName: ${functionName}`);
        const buildFolderTimestamp = Date.now();
        const buildPath = `build/functionBuilder/builds/${buildFolderTimestamp}`;
        try {
            const triggerPath = (0, utils_1.getTriggerPath)(collectionType, collectionPath, table?.triggerDepth);
            const tableSchemaPaths = (0, utils_1.getSchemaPaths)({
                collectionType,
                collectionPath,
                tables,
                tableConfigPath,
            });
            const projectId = process.env.LOCAL
                ? require("../../firebase-adminsdk.json").project_id
                : await (0, metadataService_1.getProjectId)();
            await Promise.all([
                firebaseConfig_1.db
                    .doc(functionConfigPath)
                    .set({ updatedAt: new Date() }, { merge: true }),
                firebaseConfig_1.db.doc(tableConfigPath).update({
                    functionConfigPath,
                }),
            ]);
            // duplicate functions folder to build folder
            await streamLogger.info(`Duplicating functions template to ${buildPath}`);
            await (0, terminalUtils_1.asyncExecute)(`mkdir -m 777 -p ${buildPath}; cp -Rp build/functionBuilder/functions/* ${buildPath}`, (0, logger_1.commandErrorHandler)({ user }, streamLogger));
            const success = await (0, compiler_1.default)({
                functionConfigPath,
                tableSchemaPaths,
                functionName,
                triggerPath,
                hanzoSettings: settings.data(),
            }, user, streamLogger, buildPath, buildFolderTimestamp);
            if (!success) {
                await streamLogger.error("generateConfig failed");
                await streamLogger.fail();
                return {
                    success: false,
                    reason: `generateConfig failed to complete`,
                };
            }
            await streamLogger.info("Installing dependencies...");
            await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath}; yarn install --mutex network`, (0, logger_1.commandErrorHandler)({ user }, streamLogger));
            await streamLogger.info(`Deploying ${functionName} to ${projectId}`);
            const configFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, `./builds/${buildFolderTimestamp}/src/functionConfig.js`), "utf-8");
            // replace all instances of // evaluate:require with evaluate:require
            let modifiedConfigFile = configFile.replace(/\/\/ evaluate:require/g, "evaluate:require");
            modifiedConfigFile = modifiedConfigFile.replace(/\/\/ script:require/g, "script:require");
            modifiedConfigFile = modifiedConfigFile.replace(/\/\/ extensionBody:require/g, "extensionBody:require");
            modifiedConfigFile = modifiedConfigFile.replace(/\/\/ conditions:require/g, "conditions:require");
            fs_1.default.writeFileSync(path_1.default.resolve(__dirname, `./builds/${buildFolderTimestamp}/src/functionConfig.js`), modifiedConfigFile, "utf-8");
            await new Promise((resolve) => setTimeout(resolve, 100));
            await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath}; yarn deploy --project ${projectId} --only functions`, (0, logger_1.commandErrorHandler)({ user }, streamLogger), streamLogger);
            await streamLogger.end();
            return {
                success: true,
            };
        }
        catch (error) {
            console.log(error);
            await streamLogger.error("Build Failed:\n" + JSON.stringify(error));
            await streamLogger.fail();
            return {
                success: false,
                reason: `generateConfig failed to complete`,
            };
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            reason: `function builder failed`,
        };
    }
};
exports.functionBuilder = functionBuilder;
//# sourceMappingURL=index.js.map