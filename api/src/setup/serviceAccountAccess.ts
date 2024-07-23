import { Request, Response } from "express";
import { db, auth } from "../firebaseConfig";
import { securityRules } from "firebase-admin";
export const serviceAccountAccess = async (req: Request, res: Response) => {
  try {
    const access: any = {};
    // test access to firestore
    try {
      await db.listCollections();
      const testDocRef = db.doc("_hanzo_/testingAccess");
      await testDocRef.set({ success: true });
      const testDoc = await testDocRef.get();
      if (!testDoc.exists) access.firestore = false;
      await testDocRef.delete;
      access.firestore = true;
    } catch (error) {
      console.log(error);
      access.firestore = false;
    }
    // test access to auth
    try {
      let testUser;
      try {
        testUser = await auth.createUser({
          email: "test@test.hanzo",
        });
      } catch (error) {
        testUser = await auth.getUserByEmail("test@test.hanzo");
      }

      await auth.deleteUser(testUser.uid);
      access.auth = true;
    } catch (error) {
      console.log(error);
      access.auth = false;
    }
    // test access to firestore rules
    try {
      await securityRules().getFirestoreRuleset();
      access.firestoreRules = true;
    } catch (error) {
      console.log(error);
      access.firestoreRules = false;
    }

    res.send(access);
  } catch (error) {
    res.send({ error });
  }
};
