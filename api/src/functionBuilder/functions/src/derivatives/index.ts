import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { db, auth, storage } from "../firebaseConfig";
import utilFns from "../utils";
import { LoggingFactory, HanzoLogging } from "../logging";
import { tableSchema } from "../functionConfig";
const derivative =
  (
    functionConfig: {
      fieldName: string;
      listenerFields: string[];
      evaluate: (props: {
        row: any;
        ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
        db: FirebaseFirestore.Firestore;
        auth: admin.auth.Auth;
        storage: admin.storage.Storage;
        utilFns: any;
        logging: HanzoLogging;
        tableSchema: any;
      }) => any;
    }[]
  ) =>
  async (change: functions.Change<functions.firestore.DocumentSnapshot>) => {
    try {
      const row = change.after?.data();
      const ref = change.after ? change.after.ref : change.before.ref;
      const update = await functionConfig.reduce(
        async (accUpdates: any, currDerivative) => {
          const shouldEval = utilFns.hasChanged(change)([
            ...currDerivative.listenerFields,
            "_forcedUpdateAt",
          ]);
          if (shouldEval) {
            try {
              const logging = await LoggingFactory.createDerivativeLogging(
                currDerivative.fieldName,
                ref.id,
                ref.path
              );
              const newValue = await (currDerivative as any).evaluate.default({
                row,
                ref,
                db,
                auth,
                storage,
                utilFns,
                logging,
                tableSchema: tableSchema,
              });
              if (
                newValue !== undefined &&
                newValue !== row[currDerivative.fieldName]
              ) {
                return {
                  ...(await accUpdates),
                  [currDerivative.fieldName]: newValue,
                };
              }
            } catch (error) {
              console.log(error);
            }
          }
          return await accUpdates;
        },
        {}
      );
      return update;
    } catch (error) {
      console.log(`Derivatives Error`, error);
      return {};
    }
  };

export default derivative;
