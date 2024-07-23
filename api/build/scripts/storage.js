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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data2storage = exports.url2storage = void 0;
const file_type_1 = require("file-type");
const firebaseConfig_1 = require("../firebaseConfig");
const uuid = __importStar(require("uuid"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const metadataService_1 = require("../metadataService");
const url2storage = async (url, options = {}) => {
    const response = await (0, node_fetch_1.default)(url);
    if (response.ok) {
        const dataBuffer = await response.buffer();
        const fileName = options.fileName ?? url.split("/").pop();
        return await (0, exports.data2storage)(dataBuffer, { ...options, fileName });
    }
    else {
        return null;
    }
};
exports.url2storage = url2storage;
const data2storage = async (data, options = {}) => {
    const projectId = await (0, metadataService_1.getProjectId)();
    const bucket = firebaseConfig_1.storage.bucket(options.bucket ?? `${projectId}.appspot.com`);
    const fileType = options.fileType
        ? options.fileType
        : Buffer.isBuffer(data)
            ? await (0, file_type_1.fromBuffer)(data)
            : {
                ext: ".txt",
                mime: "text/plain",
            };
    let fileName = options.fileName ?? uuid.v4();
    if (!fileName.includes(".")) {
        fileName = `${fileName}.${fileType.ext}`;
    }
    const file = bucket.file(`${options.folderPath ?? "hanzoUploads"}/${fileName}`);
    const token = uuid.v4();
    await file.save(data, {
        metadata: {
            contentType: fileType.mime,
            metadata: { firebaseStorageDownloadTokens: token },
            cacheControl: options.cacheControl ?? `public,max-age=3600`,
        },
    });
    return {
        downloadURL: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${token}`,
        name: fileName,
        type: fileType.mime,
        lastModifiedTS: new Date().getTime(),
    };
};
exports.data2storage = data2storage;
//# sourceMappingURL=storage.js.map