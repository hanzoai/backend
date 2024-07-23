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
type HanzoLogging = {
  log: (...payload: any[]) => void;
  warn: (...payload: any[]) => void;
  error: (...payload: any[]) => void;
};
interface Hanzo {
  metadata: {
    /**
     * The project ID of the project running this function.
     */
    projectId: () => Promise<string>;
    /**
     * The numeric project ID of the project running this function.
     */
    projectNumber: () => Promise<string>;
    /**
     * The email address of service account running this function.
     * This is the service account that is used to call other APIs.
     * Ensure that the service account has the correct permissions.
     */
    serviceAccountEmail: () => Promise<string>;
    /**
     * a user object of the service account running this function.
     * Compatible with Hanzo audit fields
     * Can be used to add createdBy or updatedBy fields to a document.
     */
    serviceAccountUser: () => Promise<HanzoUser>;
  };
  /**
   * Gives access to the Secret Manager.
   * manage your secrets in the Google Cloud Console.
   */
  secrets: {
    /**
     * Get an existing secret from the secret manager.
     */
    get: (
      name: SecretNames,
      version?: string
    ) => Promise<string | any | undefined>;
  };
  /**
   * Gives access to the Cloud Storage.
   */
  storage: {
    upload: {
      /**
       * uploads a file to storage bucket from an external url.
       */
      url: (
        url: string,
        options?: uploadOptions
      ) => Promise<HanzoFile | undefined>;
      /**
       * uploads a file to storage bucket from a buffer or string
       */
      data: (
        data: Buffer | string,
        options?: uploadOptions
      ) => Promise<HanzoFile | undefined>;
    };
  };
  /**
   * @deprecated will be removed in version 2.0.
   * use hanzo.secrets.get instead.
   * Get an existing secret from the secret manager.
   */
  getSecret: (
    name: SecretNames,
    version?: string
  ) => Promise<string | undefined>;
  /**
   * @deprecated will be removed in version 2.0.
   * use hanzo.metadata.serviceAccountUser instead.
   * Compatible with Hanzo audit fields
   * Can be used to add createdBy or updatedBy fields to a document.
   */
  getServiceAccountUser: () => Promise<HanzoUser>;
  /**
   * @deprecated will be removed in version 2.0.
   * use hanzo.storage.upload.url instead.
   * uploads a file to storage bucket from an external url.
   */
  url2storage: (url: string) => Promise<HanzoFile | undefined>;
}

declare const hanzo: Hanzo;
