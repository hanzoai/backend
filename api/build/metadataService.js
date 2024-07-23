"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServiceAccessToken = exports.getNumericProjectId = exports.getProjectId = exports.getServiceAccountEmail = exports.metadataService = void 0;
const axios_1 = __importDefault(require("axios"));
const axiosInstance = axios_1.default.create({
    baseURL: "http://metadata.google.internal/",
    timeout: 1000,
    headers: { "Metadata-Flavor": "Google" },
});
const metadataService = (req, res) => {
    let path = req.query.path ||
        "computeMetadata/v1/instance/service-accounts/default/scopes";
    axiosInstance.get(path).then((response) => {
        res.send({ data: response.data });
    });
};
exports.metadataService = metadataService;
const getServiceAccountEmail = async () => (await axiosInstance.get("computeMetadata/v1/instance/service-accounts")).data.split("\n")[1];
exports.getServiceAccountEmail = getServiceAccountEmail;
const getProjectId = async () => (await axiosInstance.get("computeMetadata/v1/project/project-id")).data;
exports.getProjectId = getProjectId;
const getNumericProjectId = async () => (await axiosInstance.get("computeMetadata/v1/project/numeric-project-id"))
    .data;
exports.getNumericProjectId = getNumericProjectId;
const generateServiceAccessToken = async (audience) => (await axiosInstance.get(`computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`)).data;
exports.generateServiceAccessToken = generateServiceAccessToken;
//https://www.googleapis.com/oauth2/v1/certs
//# sourceMappingURL=metadataService.js.map