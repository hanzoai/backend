import { useState, useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { differenceInDays } from "date-fns";
import { compare } from "compare-versions";

import {
  projectScope,
  hanzoRunAtom,
  hanzoRunLatestUpdateAtom,
} from "@src/atoms/projectScope";
import meta from "@root/package.json";
import { EXTERNAL_LINKS } from "@src/constants/externalLinks";
import { runRoutes } from "@src/constants/runRoutes";

// https://docs.github.com/en/rest/reference/repos#get-the-latest-release
const UPDATE_ENDPOINTS = {
  hanzo: meta.repository.url
    .replace("github.com", "api.github.com/repos")
    .replace(/.git$/, "/releases/latest"),

  hanzoRun:
    EXTERNAL_LINKS.hanzoRunGitHub.replace("github.com", "api.github.com/repos") +
    "/releases/latest",
};

/**
 * Get the latest version of Hanzo and Hanzo Run from GitHub releases,
 * and the currently deployed versions
 * @returns [latestUpdate, checkForUpdates, loading]
 */
export default function useUpdateCheck() {
  const [hanzoRun] = useAtom(hanzoRunAtom, projectScope);
  // Store latest release from GitHub
  const [latestUpdate, setLatestUpdate] = useAtom(
    hanzoRunLatestUpdateAtom,
    projectScope
  );
  const [loading, setLoading] = useState(false);

  // Check for updates using latest releases from GitHub
  const checkForUpdates = useCallback(async () => {
    setLoading(true);

    const newState = {
      lastChecked: new Date().toISOString(),
      hanzo: null,
      hanzoRun: null,
      deployedHanzo: meta.version,
      deployedHanzoRun: "",
    };

    // Make all requests simultaneously
    const [resHanzo, resHanzoRun, deployedHanzoRun] = await Promise.all([
      fetch(UPDATE_ENDPOINTS.hanzo, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }).then((r) => r.json()),
      fetch(UPDATE_ENDPOINTS.hanzoRun, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }).then((r) => r.json()),
      hanzoRun({ route: runRoutes.version }),
    ]);

    // Only store the latest release
    if (compare(resHanzo.tag_name, meta.version, ">")) newState.hanzo = resHanzo;
    if (
      deployedHanzoRun &&
      compare(resHanzoRun.tag_name, deployedHanzoRun.version, ">")
    )
      newState.hanzoRun = resHanzoRun;

    // Save deployed version
    newState.deployedHanzoRun = deployedHanzoRun?.version ?? "";

    setLatestUpdate(newState);
    setLoading(false);
  }, [setLoading, setLatestUpdate, hanzoRun]);

  // Check for new updates on page load if last check was more than 7 days ago
  // or if deployed version has changed
  useEffect(() => {
    if (loading) return;

    if (
      !latestUpdate.lastChecked ||
      differenceInDays(new Date(), new Date(latestUpdate.lastChecked)) > 7 ||
      latestUpdate.deployedHanzo !== meta.version
    )
      checkForUpdates();
  }, [latestUpdate, loading, checkForUpdates]);

  return [latestUpdate, checkForUpdates, loading] as const;
}
