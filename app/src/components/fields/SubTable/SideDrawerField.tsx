import { useMemo } from "react";
import { useAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { find, isEqual } from "lodash-es";
import { ISideDrawerFieldProps } from "@src/components/fields/types";
import { Link } from "react-router-dom";

import { Box, Stack, IconButton } from "@mui/material";
import OpenIcon from "@mui/icons-material/OpenInBrowser";

import { tableScope, tableRowsAtom } from "@src/atoms/tableScope";
import { fieldSx, getFieldId } from "@src/components/SideDrawer/utils";
import { useSubTableData } from "./utils";

export default function SubTable({ column, _hanzo_ref }: ISideDrawerFieldProps) {
  const [row] = useAtom(
    useMemo(
      () =>
        selectAtom(
          tableRowsAtom,
          (tableRows) => find(tableRows, ["_hanzo_ref.path", _hanzo_ref.path]),
          isEqual
        ),
      [_hanzo_ref.path]
    ),
    tableScope
  );

  const { documentCount, label, subTablePath } = useSubTableData(
    column as any,
    row as any,
    _hanzo_ref
  );

  return (
    <Stack direction="row" id={getFieldId(column.key)}>
      <Box sx={fieldSx}>
        {documentCount} {column.name as string}: {label}
      </Box>

      <IconButton
        component={Link}
        to={subTablePath}
        edge="end"
        size="small"
        sx={{ ml: 1 }}
        disabled={!subTablePath}
      >
        <OpenIcon />
      </IconButton>
    </Stack>
  );
}
