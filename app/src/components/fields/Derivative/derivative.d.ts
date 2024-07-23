type DerivativeContext = {
  row: Row;
  ref: FirebaseFirestore.DocumentReference;
  storage: firebasestorage.Storage;
  db: FirebaseFirestore.Firestore;
  auth: firebaseauth.BaseAuth;
  change: any;
  logging: HanzoLogging;
};

type Derivative = (context: DerivativeContext) => "PLACEHOLDER_OUTPUT_TYPE";
