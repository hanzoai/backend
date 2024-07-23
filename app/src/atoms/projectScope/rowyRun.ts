import { atom } from "jotai";
import { selectAtom, atomWithStorage } from "jotai/utils";
import { isEqual } from "lodash-es";
import { getIdTokenResult } from "firebase/auth";
import { compare } from "compare-versions";

import { projectSettingsAtom } from "./project";
import { currentUserAtom } from "./auth";
import { RunRoute, runRoutes } from "@src/constants/runRoutes";
import meta from "@root/package.json";

/**
 * Get hanzoRunUrl from projectSettings, but only update when this field changes */
const hanzoRunUrlAtom = selectAtom(
  projectSettingsAtom,
  (projectSettings) => projectSettings.hanzoRunUrl
);
/**
 * Get services from projectSettings, but only update when this field changes
 */
const hanzoRunServicesAtom = selectAtom(
  projectSettingsAtom,
  (projectSettings) => projectSettings.services,
  isEqual
);

export interface IHanzoRunRequestProps {
  /** Optionally force refresh the token */
  forceRefresh?: boolean;
  service?: "hooks" | "builder";
  /** Optionally use Hanzo Run instance on localhost */
  localhost?: boolean;

  route: RunRoute;
  body?: any;
  /** Params appended to the URL. Will be transforme to a `/`-separated string. */
  params?: string[];
  /** Parse response as JSON. Default: true */
  json?: boolean;
  /** Optionally pass an abort signal to abort the request */
  signal?: AbortSignal;
  /** Optionally pass a callback that’s called if Hanzo Run not set up */
  handleNotSetUp?: () => void;
}

/**
 * An atom that returns a function to call Hanzo Run endpoints using the URL
 * defined in project settings and retrieving a JWT token.
 *
 * Returns `false` if user not signed in or Hanzo Run not set up.
 *
 * @example Basic usage:
 * ```
 * const [hanzoRun] = useAtom(hanzoRunAtom, projectScope);
 * ...
 * await hanzoRun(...);
 * ```
 */
export const hanzoRunAtom = atom((get) => {
  const hanzoRunUrl = get(hanzoRunUrlAtom);
  const hanzoRunServices = get(hanzoRunServicesAtom);
  const currentUser = get(currentUserAtom);

  return async ({
    forceRefresh,
    localhost = false,
    service,
    route,
    params,
    body,
    signal,
    json = true,
    handleNotSetUp,
  }: IHanzoRunRequestProps): Promise<Response | any | false> => {
    if (!currentUser) {
      if (handleNotSetUp) handleNotSetUp();
      return false;
    }
    const authToken = await getIdTokenResult(currentUser!, forceRefresh);

    const serviceUrl = localhost
      ? "http://localhost:8080"
      : service
      ? hanzoRunServices?.[service]
      : hanzoRunUrl;
    if (!serviceUrl) {
      if (handleNotSetUp) handleNotSetUp();
      return false;
    }

    const { method, path } = route;
    let url = serviceUrl + path;
    if (params && params.length > 0) url = url + "/" + params.join("/");
    const response = await fetch(url, {
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken.token,
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      // body data type must match "Content-Type" header
      body: body && method !== "GET" ? JSON.stringify(body) : null,
      signal,
    });

    if (json) return await response.json();
    return response;
  };
});

/** Store deployed Hanzo Run version */
export const hanzoRunVersionAtom = atom(async (get) => {
  const hanzoRun = get(hanzoRunAtom);
  try {
    const response = await hanzoRun({ route: runRoutes.version });
    return response.version as string | false;
  } catch (e) {
    console.log(e);
    return false;
  }
});

/**
 * Helper function to check if deployed Hanzo Run version
 * is compatible with a feature
 */
export const compatibleHanzoRunVersionAtom = atom((get) => {
  const deployedVersion = get(hanzoRunVersionAtom);

  return ({
    minVersion,
    maxVersion,
  }: {
    minVersion?: string;
    maxVersion?: string;
  }) => {
    if (!deployedVersion) return false;
    if (minVersion && compare(deployedVersion, minVersion, "<")) return false;
    if (maxVersion && compare(deployedVersion, maxVersion, ">")) return false;
    return true;
  };
});

type HanzoRunLatestUpdate = {
  lastChecked: string;
  hanzo: null | Record<string, any>;
  hanzoRun: null | Record<string, any>;
  deployedHanzo: string;
  deployedHanzoRun: string;
};
/** Store latest update from GitHub releases and currently deployed versions */
export const hanzoRunLatestUpdateAtom = atomWithStorage<HanzoRunLatestUpdate>(
  "__HANZO__UPDATE_CHECK",
  {
    lastChecked: "",
    hanzo: null,
    hanzoRun: null,
    deployedHanzo: meta.version,
    deployedHanzoRun: "",
  }
);
