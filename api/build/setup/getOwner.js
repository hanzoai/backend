"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwner = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const getOwner = async () => {
    const userManagementDoc = await firebaseConfig_1.db.doc("_hanzo_/userManagement").get();
    return userManagementDoc.get("owner");
};
exports.getOwner = getOwner;
//# sourceMappingURL=getOwner.js.map