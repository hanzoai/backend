"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateConfig;
const terminal_1 = require("./terminal");
const extensions_1 = require("./extensions");
const terminalUtils_1 = require("../../terminalUtils");
const _ = __importStar(require("lodash"));
const fs = require("fs");
const loader_1 = require("./loader");
const logger_1 = require("../logger");
const firebaseConfig_1 = require("../../firebaseConfig");
const path = require("path");
const metadataService_1 = require("../../metadataService");
async function generateConfig(data, user, streamLogger, buildPath, buildFolderTimestamp) {
    const projectId = await (0, metadataService_1.getProjectId)();
    await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath};pwd;ls -al`, () => {
        streamLogger.info("1");
    }, streamLogger);
    await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath};less package.json`, () => {
        streamLogger.info("2");
    }, streamLogger);
    await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath}/src;pwd;ls -al`, () => {
        streamLogger.info("3");
    }, streamLogger);
    await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath};yarn install --mutex network`, () => {
        streamLogger.info("Base dependencies installed successfully");
    }, streamLogger);
    await streamLogger.info(`Generating schema...`);
    const { functionConfigPath, tableSchemaPaths, triggerPath, functionName, hanzoSettings, } = data;
    const configs = (await Promise.all(tableSchemaPaths.map((path) => (0, loader_1.getConfigFromTableSchema)(path, streamLogger)))).filter((i) => i !== false);
    const combinedConfig = (0, loader_1.combineConfigs)(configs);
    await firebaseConfig_1.db.doc(functionConfigPath).set({
        config: combinedConfig,
        updatedAt: new Date(),
    }, { merge: true });
    await streamLogger.info(`Generating config file...`);
    const region = hanzoSettings.cloudFunctionsRegion ?? "us-central1";
    const searchHost = hanzoSettings.services?.search ?? null;
    await (0, loader_1.generateFile)({
        ...combinedConfig,
        functionName,
        triggerPath,
        projectId,
        region,
        searchHost,
    }, buildFolderTimestamp);
    await streamLogger.info(`Retrieving config file...`);
    const configFile = fs.readFileSync(path.resolve(__dirname, `../builds/${buildFolderTimestamp}/src/functionConfig.ts`), "utf-8");
    await streamLogger.info(`Validating config file...`);
    const isFunctionConfigValid = await (0, terminalUtils_1.asyncExecute)(`cd ${buildPath}/src;tsc functionConfig.ts`, (0, logger_1.commandErrorHandler)({
        user,
        functionConfigTs: configFile,
        description: `Invalid compiled functionConfig.ts`,
    }, streamLogger), streamLogger);
    if (!isFunctionConfigValid) {
        throw new Error("Invalid compiled functionConfig.ts");
    }
    await streamLogger.info(`Config file: ${JSON.stringify(configFile)}`);
    const { derivativesConfig, defaultValueConfig, extensionsConfig, } = require(`../builds/${buildFolderTimestamp}/src/functionConfig`);
    const requiredDepsReducer = (acc, curr) => {
        if (curr.requiredPackages && curr.requiredPackages.length > 0) {
            return acc.concat(curr.requiredPackages);
        }
        return acc;
    };
    const derivativesRequiredDeps = derivativesConfig.reduce(requiredDepsReducer, []);
    const defaultValueRequiredDeps = defaultValueConfig.reduce(requiredDepsReducer, []);
    const extensionsRequiredDeps = extensionsConfig.reduce(requiredDepsReducer, []);
    // remove duplicates from requiredDependencies with lodash
    const requiredDependencies = _.uniqWith([
        ...derivativesRequiredDeps,
        ...defaultValueRequiredDeps,
        ...extensionsRequiredDeps,
    ], _.isEqual);
    // remove all dependencies that are already installed
    const packageJson = require(`../builds/${buildFolderTimestamp}/package.json`);
    const installedDependencies = Object.keys(packageJson.dependencies);
    const requiredDependenciesToInstall = requiredDependencies?.filter((i) => !installedDependencies.includes(i.name));
    await streamLogger.info(`Installing dependencies: ${JSON.stringify(requiredDependenciesToInstall)}`);
    if (requiredDependenciesToInstall &&
        requiredDependenciesToInstall.length > 0) {
        const packagesAdded = await (0, terminal_1.addPackages)(requiredDependenciesToInstall, user, streamLogger, buildPath);
        if (!packagesAdded) {
            return false;
        }
    }
    const requiredExtensions = extensionsConfig.map((s) => s.type);
    await streamLogger.info(`Installing extensions: ${JSON.stringify(requiredExtensions)}`);
    for (const lib of requiredExtensions) {
        const success = await (0, extensions_1.addExtensionLib)(lib, user, streamLogger, buildPath, buildFolderTimestamp);
        if (!success) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=index.js.map