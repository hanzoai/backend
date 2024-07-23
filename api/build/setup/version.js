"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
const meta = require("../../package.json");
const version = async () => ({ version: meta.version });
exports.version = version;
//# sourceMappingURL=version.js.map