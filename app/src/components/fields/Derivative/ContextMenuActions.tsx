import { useAtom } from "jotai";
import { find, get } from "lodash-es";
import { useSnackbar } from "notistack";

import { Button } from "@mui/material";
import ReEvalIcon from "@mui/icons-material/ReplayOutlined";
import EvalIcon from "@mui/icons-material/PlayCircleOutline";
import InlineOpenInNewIcon from "@src/components/InlineOpenInNewIcon";

import {
  projectScope,
  compatibleHanzoRunVersionAtom,
  hanzoRunAtom,
  projectIdAtom,
  projectSettingsAtom,
} from "@src/atoms/projectScope";
import {
  tableScope,
  tableSettingsAtom,
  tableSchemaAtom,
  tableRowsAtom,
} from "@src/atoms/tableScope";
import { getTableSchemaPath } from "@src/utils/table";
import { IFieldConfig } from "@src/components/fields/types";
import { runRoutes } from "@src/constants/runRoutes";

export interface IContextMenuActions {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const ContextMenuActions: IFieldConfig["contextMenuActions"] = (
  selectedCell,
  reset
) => {
  const [hanzoRun] = useAtom(hanzoRunAtom, projectScope);
  const [tableSettings] = useAtom(tableSettingsAtom, tableScope);
  const [tableSchema] = useAtom(tableSchemaAtom, tableScope);
  const [tableRows] = useAtom(tableRowsAtom, tableScope);
  const [projectId] = useAtom(projectIdAtom, projectScope);
  const [projectSettings] = useAtom(projectSettingsAtom, projectScope);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [compatibleHanzoRunVersion] = useAtom(
    compatibleHanzoRunVersionAtom,
    projectScope
  );

  const selectedCol = tableSchema.columns?.[selectedCell.columnKey];
  if (!selectedCol) return [];

  const selectedRow = find(tableRows, ["_hanzo_ref.path", selectedCell.path]);
  const cellValue = get(selectedRow, selectedCol.fieldName);

  if (!selectedCol) return [];

  // don't show evaluate button if function has external dependency
  const code =
    selectedCol.config?.derivativeFn ?? selectedCol.config?.script ?? "";
  if (
    code.includes("require(") &&
    compatibleHanzoRunVersion({ maxVersion: "1.6.2" })
  )
    return [];

  const handleEvaluate = async () => {
    try {
      if (!selectedCol || !hanzoRun || !selectedRow) return;
      reset();
      const evaluatingSnackKey = enqueueSnackbar("Evaluating…");
      const result = await hanzoRun({
        route: runRoutes.evaluateDerivative,
        body: {
          ref: { path: selectedCell.path },
          schemaDocPath: getTableSchemaPath(tableSettings),
          columnKey: selectedCol.key,
        },
      });
      closeSnackbar(evaluatingSnackKey);
      if (result.success === false) {
        enqueueSnackbar(result.message, { variant: "error" });
      } else {
        enqueueSnackbar("Cell evaluated", { variant: "success" });
      }
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        enqueueSnackbar(
          "Evaluation failed. Hanzo Run is likely out of memory. Please allocate more in GCP console.",
          {
            variant: "warning",
            persist: true,
            action: (snackbarId) => (
              <Button
                href={`https://console.cloud.google.com/run/deploy/${
                  projectSettings.hanzoRunRegion ?? "us-central1"
                }/hanzo-backend?project=${projectId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => closeSnackbar(snackbarId)}
                variant="contained"
                color="secondary"
              >
                Open GCP Console <InlineOpenInNewIcon />
              </Button>
            ),
          }
        );
      } else {
        enqueueSnackbar(`Failed: ${error}`, { variant: "error" });
      }
    }
  };
  const isEmpty =
    cellValue === "" || cellValue === null || cellValue === undefined;
  const contextMenuActions = [
    {
      label: isEmpty ? "Evaluate" : "Re-evaluate",
      icon: isEmpty ? <EvalIcon /> : <ReEvalIcon />,
      onClick: handleEvaluate,
    },
  ];

  return contextMenuActions;
};

export default ContextMenuActions;
