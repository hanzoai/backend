"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.region = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const region = async () => {
    try {
        const settings = await firebaseConfig_1.db.doc("_hanzo_/settings").get();
        return { region: settings.data().hanzoRunRegion };
    }
    catch (error) {
        return { region: null };
    }
};
exports.region = region;
//# sourceMappingURL=region.js.map