import { db } from "../firebaseConfig";
export const getOwner = async () => {
  const userManagementDoc = await db.doc("_hanzo_/userManagement").get();
  return userManagementDoc.get("owner");
};
