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
exports.removeRefsOnTargetDelete = exports.removeTargetRef = exports.addTargetRef = void 0;
const admin = __importStar(require("firebase-admin"));
const fieldValue = admin.firestore.FieldValue;
const firebaseConfig_1 = require("../firebaseConfig");
const TARGET_SUB_COLLECTION = "_FT_BINDINGS";
//sample bindings document
// /_FT_BINDINGS/{docId}
// docId is encodeURIComponent of docPath
/**
 
{
    [targetCollectionName]:{
      [targetField]:{
        trackedFields:[]
        targets{
          [docId]:true
        }
      }
    }
}
 */
// Target changes Trigger
// add propagation reference from source subcollection
const addTargetRef = (targetRef, sourceDocPath, targetFieldKey, trackedFields) => firebaseConfig_1.db.doc(`${TARGET_SUB_COLLECTION}/${encodeURIComponent(sourceDocPath)}`).set({
    [encodeURIComponent(targetRef.parent.path)]: {
        [targetFieldKey]: {
            trackedFields,
            targets: { [targetRef.id]: true },
        },
    },
}, { merge: true });
exports.addTargetRef = addTargetRef;
// remove propagation reference from source subcollection
const removeTargetRef = (targetRef, sourceDocPath, targetFieldKey) => firebaseConfig_1.db.doc(`${TARGET_SUB_COLLECTION}/${encodeURIComponent(sourceDocPath)}`).set({
    [encodeURIComponent(targetRef.parent.path)]: {
        [targetFieldKey]: {
            targets: { [targetRef.id]: fieldValue.delete() },
        },
    },
}, { merge: true });
exports.removeTargetRef = removeTargetRef;
// db
// .doc(`${sourceDocPath}/${TARGET_SUB_COLLECTION}/${encodeURIComponent(targetRef.parent.path)}`)
// .set({ [targetFieldKey]:{targets:{[targetRef.id]:fieldValue.delete()}}},{merge: true});
// new Promise((resolve, reject) => db
//   .collection(`${sourceDocPath}/${TARGET_SUB_COLLECTION}`)
//   .where("targetRef", "==", targetRef)
//   .where("targetFieldKey","==",targetFieldKey)
//   .get()
//   .then((queryResult) => resolve(Promise.all(queryResult.docs.map((doc) => doc.ref.delete())))));
// removes all references of deleted targets
const removeRefsOnTargetDelete = (targetRef, targetFieldKey) => new Promise((resolve, reject) => firebaseConfig_1.db
    .collection(TARGET_SUB_COLLECTION)
    .where(`${targetRef.parent.path}.${targetFieldKey}.targets.${targetRef.id}`, "==", true)
    .get()
    .then((queryResult) => resolve(Promise.all(queryResult.docs.map((doc) => doc.ref.set({
    [encodeURIComponent(targetRef.parent.path)]: {
        [targetFieldKey]: {
            targets: { [targetRef.id]: fieldValue.delete() },
        },
    },
}, { merge: true }))))));
exports.removeRefsOnTargetDelete = removeRefsOnTargetDelete;
//# sourceMappingURL=TargetFns.js.map