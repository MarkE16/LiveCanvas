// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo.png";
import { Snackbar } from "@mui/material";
import { useState } from "react";

// Types
import type { FC } from "react";

// Styles
import "./Navbar.styles.css";

// Components
import ExportCanvasButton from "../ExportCanvasButton/ExportCanvasButton";
import { Link } from "../../renderer/Link";

const Navbar: FC = () => {
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const openSnackbar = () => {
		setSnackbarOpen(true);
	};

	const closeSnackbar = () => {
		setSnackbarOpen(false);
	};

	return (
		<header>
			<nav id="navbar-container">
				<section id="navbar-links-section">
					<div id="navbar-logo-container">
						<img
							id="navbar-logo"
							src={logo}
							alt="logo"
						/>
					</div>
					<div id="navbar-links">
						<Link href="/">Home</Link>
						<button onClick={openSnackbar}>File</button>
						<button onClick={openSnackbar}>Edit</button>
						<button onClick={openSnackbar}>View</button>
						<button onClick={openSnackbar}>Filter</button>
						<button onClick={openSnackbar}>Admin</button>
					</div>
				</section>
				<section id="navbar-buttons-section">
					<ExportCanvasButton />
				</section>
			</nav>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={closeSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				message="This feature is not yet implemented."
				onClick={closeSnackbar}
			/>
		</header>
	);
};

export default Navbar;
