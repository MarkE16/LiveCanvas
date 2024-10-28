// Lib
import { Modal, Box, Button, Typography } from "@mui/material";

// Types
import type { FC } from "react";

type AlphaSoftwareAgreementModalProps = {
	open: boolean;
	onClose: () => void;
};

// Styles
import "./AlphaSoftwareAgreementModal.styles.css";

const AlphaSoftwareAgreementModal: FC<AlphaSoftwareAgreementModalProps> = ({
	open,
	onClose
}) => {
	return (
		<Modal
			open={open}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 400,
					bgcolor: "background.paper",
					border: "2px solid #000",
					boxShadow: 24,
					p: 4
				}}
			>
				<Typography
					id="modal-modal-title"
					variant="h6"
					component="h2"
				>
					Alpha Software Agreement
				</Typography>
				<Typography
					id="modal-modal-description"
					sx={{ mt: 2 }}
				>
					This software is in alpha and may contain bugs. By using this
					software, you agree to that you are okay with that.
				</Typography>
				<Button
					onClick={onClose}
					sx={{ mt: 2 }}
				>
					I Agree
				</Button>
			</Box>
		</Modal>
	);
};

export default AlphaSoftwareAgreementModal;
