import { Link } from "react-router-dom";
import { useAtom } from "jotai";

import {
  Typography,
  Button,
  DialogContentText,
  Link as MuiLink,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";

import Modal from "@src/components/Modal";
import MemoizedText from "@src/components/Modal/MemoizedText";
import InlineOpenInNewIcon from "@src/components/InlineOpenInNewIcon";

import {
  projectScope,
  userRolesAtom,
  projectSettingsAtom,
  hanzoRunModalAtom,
} from "@src/atoms/projectScope";
import { ROUTES } from "@src/constants/routes";
import { WIKI_LINKS } from "@src/constants/externalLinks";

/**
 * Display a modal asking the user to deploy or upgrade Hanzo Run
 * using `hanzoRunModalAtom` in `globalState`
 * @see {@link hanzoRunModalAtom | Usage example}
 */
export default function HanzoRunModal() {
  const [userRoles] = useAtom(userRolesAtom, projectScope);
  const [projectSettings] = useAtom(projectSettingsAtom, projectScope);
  const [hanzoRunModal, setHanzoRunModal] = useAtom(
    hanzoRunModalAtom,
    projectScope
  );

  const handleClose = () => setHanzoRunModal({ ...hanzoRunModal, open: false });

  const showUpdateModal = hanzoRunModal.version && projectSettings?.hanzoRunUrl;

  return (
    <Modal
      open={hanzoRunModal.open}
      onClose={handleClose}
      title={
        <MemoizedText>
          {hanzoRunModal.feature
            ? `${
                showUpdateModal ? "Update" : "Set up"
              } Cloud Functions to use ${hanzoRunModal.feature}`
            : `Your Cloud isn’t set up`}
        </MemoizedText>
      }
      maxWidth="xs"
      body={
        <>
          {showUpdateModal && (
            <DialogContentText variant="button" paragraph>
              {hanzoRunModal.feature || "This feature"} requires Hanzo Run v
              {hanzoRunModal.version} or later.
            </DialogContentText>
          )}

          <DialogContentText paragraph>
            Cloud Functions are free to use in our Base plan, you just need to
            set a few things up first. Enable Cloud Functions for:
          </DialogContentText>

          <Box
            component="ol"
            sx={{
              margin: 0,
              padding: 0,
              alignSelf: "stretch",
              "& li": {
                listStyleType: "none",
                display: "flex",
                gap: 1,
                marginBottom: 2,

                "& svg": {
                  display: "flex",
                  fontSize: "1.25rem",
                  color: "action.active",
                },
              },
            }}
          >
            <li>
              <CheckIcon />
              Derivative fields, Extensions, Webhooks
            </li>
            <li>
              <CheckIcon />
              Table and Action scripts
            </li>
            <li>
              <CheckIcon />
              Easy Cloud Function deployment
            </li>
          </Box>

          <MuiLink
            href={WIKI_LINKS.hanzoRun}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "flex", mb: 3 }}
          >
            Learn more
            <InlineOpenInNewIcon />
          </MuiLink>

          <Button
            component={Link}
            to={ROUTES.projectSettings + "#hanzoRun"}
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClose}
            style={{ display: "flex" }}
            disabled={!userRoles.includes("ADMIN")}
          >
            Set up Cloud Functions
          </Button>

          {!userRoles.includes("ADMIN") && (
            <Typography
              variant="body2"
              textAlign="center"
              color="error"
              sx={{ mt: 1 }}
            >
              Only admins can set up Cloud Functions
            </Typography>
          )}
        </>
      }
    />
  );
}
