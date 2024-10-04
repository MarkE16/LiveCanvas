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
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Mobile Not Supported
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Apologies, but this software is not supported on mobile devices. Please use a desktop or laptop computer.
        </Typography>
      </Box>
    </Modal>
  );
}

export default MobileNotSupportedModal;