"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteUserService = exports.telemetryRuntimeDependencyPerformance = exports.telemetryError = exports.telemetry = exports.getExtension = void 0;
const axios_1 = __importDefault(require("axios"));
const metadataService_1 = require("./metadataService");
const meta = require("../package.json");
const getAxiosInstance = async () => {
    const baseURL = process.env.DEV === "true"
        ? "https://hanzo-run-service-xxxxxxxxxx-xx.x.run.app"
        : "https://hanzo.run/";
    const authToken = await (0, metadataService_1.generateServiceAccessToken)(baseURL);
    return axios_1.default.create({
        baseURL,
        timeout: 1000,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + authToken,
        },
    });
};
const getExtension = async (extensionId) => {
    const axiosInstance = await getAxiosInstance();
    return (await axiosInstance.get(`extensions/${extensionId}`)).data;
};
exports.getExtension = getExtension;
let projectId;
const telemetryInstance = axios_1.default.create({
    baseURL: "https://hanzo.events/",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    },
});
const telemetry = async (event) => {
    if (!projectId) {
        projectId = await (0, metadataService_1.getProjectId)();
    }
    const body = {
        projectId,
        event,
        source: meta.name,
    };
    return telemetryInstance.post(`monitor`, body);
};
exports.telemetry = telemetry;
const telemetryError = async (event, error) => {
    if (!projectId) {
        projectId = await (0, metadataService_1.getProjectId)();
    }
    const body = {
        projectId,
        event,
        source: meta.name,
        error: JSON.stringify(error),
    };
    console.log("error", body);
    return telemetryInstance.post(`error`, body);
};
exports.telemetryError = telemetryError;
const telemetryRuntimeDependencyPerformance = async ({ functionStartTime, functionEndTime, yarnStartTime, yarnFinishTime, dependenciesString, }) => {
    if (!projectId) {
        projectId = await (0, metadataService_1.getProjectId)();
    }
    const body = {
        projectId,
        source: meta.name,
        functionStartTime,
        functionEndTime,
        yarnStartTime,
        yarnFinishTime,
        dependenciesString,
    };
    return telemetryInstance.post(`runtime-dependency-performance`, body);
};
exports.telemetryRuntimeDependencyPerformance = telemetryRuntimeDependencyPerformance;
const inviteUserService = async (projectId, newUser, inviter) => {
    const axiosInstance = await getAxiosInstance();
    return (await axiosInstance.post(`inviteUser`, {
        projectId,
        newUser,
        inviter,
    })).data;
};
exports.inviteUserService = inviteUserService;
//# sourceMappingURL=hanzoService.js.map