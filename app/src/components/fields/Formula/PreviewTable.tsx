import TablePage from "@src/pages/Table/TablePage";
import { Box } from "@mui/material";

const PreviewTable = () => {
  return (
    <Box
      sx={{
        maxHeight: 300,
        overflow: "auto",
        marginTop: 1,
        marginLeft: 0,

        // table toolbar
        "& > div:first-child": {
          display: "none",
        },
        // table grid
        "& > div:nth-of-type(2)": {
          height: "unset",
        },
        // emtpy state
        "& .empty-state": {
          display: "none",
        },
        // column actions - add column
        '& [data-col-id="_hanzo_column_actions"]': {
          display: "none",
        },
        // row headers - sort by, column settings
        '& [data-row-id="_hanzo_header"] > button': {
          display: "none",
        },
        // row headers - drag handler
        '& [data-row-id="_hanzo_header"] > .column-drag-handle': {
          display: "none !important",
        },
        // row headers - resize handler
        '& [data-row-id="_hanzo_header"] >:last-child': {
          display: "none !important",
        },
      }}
    >
      <TablePage disableModals={true} disableSideDrawer={true} />
    </Box>
  );
};

export default PreviewTable;
