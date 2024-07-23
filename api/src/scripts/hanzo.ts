import { getSecret, getServiceAccountUser } from "./utils";
import { url2storage, data2storage } from "./storage";
import {
  getNumericProjectId,
  getProjectId,
  getServiceAccountEmail,
} from "../metadataService";
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
import { GoogleAuth } from "google-auth-library";
async function generateAccessToken() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

export interface Hanzo {
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
        options: uploadOptions
      ) => Promise<HanzoFile | undefined>;
      data: (
        data: Buffer | string,
        options: uploadOptions
      ) => Promise<HanzoFile | undefined>;
    };
  };
}
const hanzo: Hanzo = {
  metadata: {
    projectId: getProjectId,
    projectNumber: getNumericProjectId,
    serviceAccountEmail: getServiceAccountEmail,
    serviceAccountUser: getServiceAccountUser,
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
