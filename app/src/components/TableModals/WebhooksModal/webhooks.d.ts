type Condition = (args: {
  req: WebHookRequest;
  db: FirebaseFirestore.Firestore;
  ref: FirebaseFirestore.CollectionReference;
  res: Response;
  logging: HanzoLogging;
}) => Promise<any>;

type Parser = (args: {
  req: WebHookRequest;
  db: FirebaseFirestore.Firestore;
  ref: FirebaseFirestore.CollectionReference;
  logging: HanzoLogging;
}) => Promise<any>;
