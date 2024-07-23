import { getSecret } from "./utils";
import { url2storage, data2storage } from "./utils/storage";
import { GoogleAuth } from "google-auth-library";
async function generateAccessToken() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}
type HanzoFile = {
  downloadURL: string;
  name: string;
  type: string;
  lastModifiedTS: number;
};
type HanzoUser = {
  email: any;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  uid: string;
  timestamp: number;
};
type uploadOptions = {
  bucket?: string;
  folderPath?: string;
  fileName?: string;
};
interface Hanzo {
  metadata: {
    projectId: () => Promise<string>;
    projectNumber: () => Promise<string>;
    serviceAccountEmail: () => Promise<string>;
    serviceAccountUser: () => Promise<HanzoUser>;
    serviceAccountAccessToken: () => Promise<string>;
  };
  secrets: {
    get: (name: string, version?: string) => Promise<string | any | undefined>;
  };
  storage: {
    upload: {
      url: (
        url: string,
        options?: uploadOptions
      ) => Promise<HanzoFile | undefined>;
      data: (
        data: Buffer | string,
        options?: uploadOptions
      ) => Promise<HanzoFile | undefined>;
    };
  };
}

const hanzo: Hanzo = {
  metadata: {
    projectId: async () => process.env.GCLOUD_PROJECT,
    projectNumber: async () => "",
    serviceAccountEmail: async () =>
      `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
    serviceAccountUser: async () => ({
      email: `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
      emailVerified: true,
      displayName: "Default Service Account",
      photoURL: "",
      uid: `serviceAccount:${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`,
      timestamp: new Date().getTime(),
    }),
    serviceAccountAccessToken: generateAccessToken,
  },
  secrets: {
    get: getSecret,
  },
  storage: {
    upload: {
      url: url2storage,
      data: data2storage,
    },
  },
};
export default hanzo;
