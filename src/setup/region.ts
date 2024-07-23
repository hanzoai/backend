import { db } from "../firebaseConfig";
export const region = async () => {
  try {
    const settings = await db.doc("_hanzo_/settings").get();
    return { region: settings.data().hanzoRunRegion };
  } catch (error) {
    return { region: null };
  }
};
