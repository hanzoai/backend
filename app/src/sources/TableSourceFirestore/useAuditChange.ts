import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";

import {
  projectScope,
  hanzoRunAtom,
  compatibleHanzoRunVersionAtom,
  currentUserAtom,
} from "@src/atoms/projectScope";
import {
  tableScope,
  tableSettingsAtom,
  auditChangeAtom,
} from "@src/atoms/tableScope";
import { runRoutes } from "@src/constants/runRoutes";
import { hanzoUser } from "@src/utils/table";

/**
 * Sets the value of auditChangeAtom
 */
export default function useAuditChange() {
  const setAuditChange = useSetAtom(auditChangeAtom, tableScope);
  const [hanzoRun] = useAtom(hanzoRunAtom, projectScope);
  const [currentUser] = useAtom(currentUserAtom, projectScope);

  const [compatibleHanzoRunVersion] = useAtom(
    compatibleHanzoRunVersionAtom,
    projectScope
  );
  const [tableSettings] = useAtom(tableSettingsAtom, tableScope);

  useEffect(() => {
    if (
      !tableSettings?.id ||
      !tableSettings?.collection ||
      !tableSettings.audit ||
      !compatibleHanzoRunVersion({ minVersion: "1.1.1" })
    ) {
      setAuditChange(undefined);
      return;
    }

    setAuditChange(
      () =>
        (
          type: "ADD_ROW" | "UPDATE_CELL" | "DELETE_ROW",
          rowId: string,
          data?: { updatedField?: string }
        ) =>
          hanzoRun({
            route: runRoutes.auditChange,
            body: {
              type,
              hanzoUser: hanzoUser(currentUser!),
              ref: {
                rowPath: tableSettings.collection,
                rowId,
                tableId: tableSettings.id,
                collectionPath: tableSettings.collection,
              },
              data,
            },
          }).catch(console.log)
    );

    return () => setAuditChange(undefined);
  }, [setAuditChange, hanzoRun, compatibleHanzoRunVersion, tableSettings]);
}
