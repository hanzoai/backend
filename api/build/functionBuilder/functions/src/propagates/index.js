"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = propagate;
const SourceFns_1 = require("./SourceFns");
const TargetFns_1 = require("./TargetFns");
//import { asyncForEach} from '../utils'
const propagateChangesOnTrigger = (change, triggerType) => {
    switch (triggerType) {
        case "update":
            return (0, SourceFns_1.propagateChanges)(change.after);
        case "delete":
            return (0, SourceFns_1.removeCopiesOfDeleteDoc)(change.before.ref);
        case "create":
        default:
            return false;
    }
};
const updateLinks = (change, config) => {
    const beforeDocPaths = change.before.get(config.fieldName)
        ? change.before.get(config.fieldName).map((x) => x.docPath)
        : [];
    const afterDocPaths = change.after.get(config.fieldName)
        ? change.after.get(config.fieldName).map((x) => x.docPath)
        : [];
    const addedDocPaths = afterDocPaths.filter((x) => !beforeDocPaths.includes(x));
    const removedDocPaths = beforeDocPaths.filter((x) => !afterDocPaths.includes(x));
    if (addedDocPaths.length !== 0 || removedDocPaths.length !== 0) {
        const addPromises = addedDocPaths.map((docPath) => (0, TargetFns_1.addTargetRef)(change.after.ref, docPath, config.fieldName, config.trackedFields));
        const removePromises = removedDocPaths.map((docPath) => (0, TargetFns_1.removeTargetRef)(change.after.ref, docPath, config.fieldName));
        return Promise.all([...addPromises, ...removePromises]);
    }
    else {
        return false;
    }
};
function propagate(change, config, triggerType) {
    const promises = [];
    if (["delete", "update"].includes(triggerType)) {
        const propagateChangesPromise = propagateChangesOnTrigger(change, triggerType);
        promises.push(propagateChangesPromise);
    }
    if (config.length > 0) {
        if (triggerType === "delete") {
            config.forEach((c) => promises.push((0, TargetFns_1.removeRefsOnTargetDelete)(change.before.ref, c.fieldName)));
        }
        else if (triggerType === "update") {
            config.forEach((c) => promises.push(updateLinks(change, c)));
        }
    }
    return Promise.allSettled(promises);
}
//# sourceMappingURL=index.js.map