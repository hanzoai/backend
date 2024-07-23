"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCopiesOfDeleteDoc = exports.propagateChanges = void 0;
//import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
const utils_1 = require("../utils");
const firebaseConfig_1 = require("../firebaseConfig");
const TARGET_SUB_COLLECTION = "_FT_BINDINGS";
//sample binding document
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
// source changes Trigger
// check and propagate any tracked changes to
const propagateChanges = (docSnapshot) => new Promise((resolve, reject) => firebaseConfig_1.db
    .collection(TARGET_SUB_COLLECTION)
    .doc(encodeURIComponent(docSnapshot.ref.path))
    .get()
    .then((doc) => {
    const promises = [];
    const docData = doc.data();
    if (!doc.exists) {
        resolve(false);
        return;
    }
    const targetCollectionPaths = Object.keys(docData);
    targetCollectionPaths.forEach((cPath) => {
        const targetFieldKeys = Object.keys(docData[cPath]);
        targetFieldKeys.forEach((targetFieldKey) => {
            const { trackedFields, targets } = docData[cPath][targetFieldKey];
            const fieldPromises = Object.keys(targets).map(async (targetDocId) => {
                const targetRef = firebaseConfig_1.db
                    .collection(decodeURIComponent(cPath))
                    .doc(targetDocId);
                const targetDoc = await targetRef.get();
                if (!targetDoc.exists)
                    return false;
                const targetFieldValue = targetDoc.get(targetFieldKey);
                const indexOfCurrentTarget = targetFieldValue.findIndex((element) => element.docPath === docSnapshot.ref.path);
                if (indexOfCurrentTarget > -1) {
                    targetFieldValue[indexOfCurrentTarget].snapshot = (0, utils_1.rowReducer)(trackedFields, docSnapshot.data());
                    await targetRef.update({
                        [targetFieldKey]: targetFieldValue,
                    });
                    return true;
                }
                else
                    return false;
            });
            fieldPromises.forEach((p) => promises.push(p));
        });
    });
    resolve(Promise.allSettled(promises));
    return;
}));
exports.propagateChanges = propagateChanges;
// when deleting a document all snapshot copies of it in
const removeCopiesOfDeleteDoc = (sourceDocRef) => sourceDocRef
    .collection(TARGET_SUB_COLLECTION)
    .get()
    .then((queryResult) => {
    queryResult.docs.map(async (doc) => {
        const { targetRef, targetFieldKey } = doc.data();
        const targetDoc = await targetRef.get();
        const currentTargetFieldValue = targetDoc.get(targetFieldKey);
        const newTargetFieldValue = currentTargetFieldValue.filter(({ docPath }) => docPath !== sourceDocRef.path);
        await targetRef.update({ [targetFieldKey]: newTargetFieldValue });
        await doc.ref.delete();
    });
});
exports.removeCopiesOfDeleteDoc = removeCopiesOfDeleteDoc;
//# sourceMappingURL=SourceFns.js.map