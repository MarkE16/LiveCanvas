// Lib
import { Modal, Box, Typography } from "@mui/material";

// Types
import { FC } from "react";

// Styles
import "./MobileNotSupportedModal.styles.css";

type MobileNotSupportedModalProps = {
  open: boolean;
};

const MobileNotSupportedModal: FC<MobileNotSupportedModalProps> = ({ open }) => {
  return (
    <Modal
      open={open}
      className="mobile-not-supported-modal"
    >
      <Box className="modal-content">
        <Typography variant="h4" className="title">
          Mobile Not Supported
        </Typography>
        <Typography variant="body1" className="body">
          Sorry, but this app is not supported on mobile devices. Please use a desktop or laptop computer.
        </Typography>
      </Box>
    </Modal>
  );
}

export default MobileNotSupportedModal;