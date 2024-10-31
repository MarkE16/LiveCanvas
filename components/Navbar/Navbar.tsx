// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo.png";
import { Snackbar, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { Link } from "../../renderer/Link";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC } from "react";

// Styles
import "./Navbar.styles.css";

const Navbar: FC = () => {
	const [exporting, setExporting] = useState<boolean>(false);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const width = useAppSelector((state) => state.canvas.width);
	const height = useAppSelector((state) => state.canvas.height);
	const { get } = useIndexed();

	const openSnackbar = () => {
		setSnackbarOpen(true);
	};

	const closeSnackbar = () => {
		setSnackbarOpen(false);
	};

	const handleExport = async () => {
		setExporting(true);
		const substituteCanvas = document.createElement("canvas");

		// Set the canvas size (assuming all layers have the same dimensions)
		substituteCanvas.width = width; // Set to your canvas width
		substituteCanvas.height = height; // Set to your canvas height

		const ctx = substituteCanvas.getContext("2d");

		// Before drawing the images,
		// let's give the canvas a white background, as by default it's transparent.
		ctx!.fillStyle = "white";
		ctx!.fillRect(0, 0, width, height);

		const layers = await get<[string, Blob][]>("layers", { asEntries: true });

		const promises = layers.toReversed().map((layer) => {
			return new Promise<void>((resolve) => {
				const [_, blob] = layer;

				const img = new Image();
				img.src = URL.createObjectURL(blob);

				img.onload = () => {
					ctx!.drawImage(img, 0, 0, width, height);

					URL.revokeObjectURL(img.src);
					resolve();
				};
			});
		});

		Promise.all(promises).then(() => {
			const image = substituteCanvas.toDataURL("image/jpeg", 1.0);
			const a = document.createElement("a");

			a.href = image;
			a.download = "canvas.jpg";
			a.click();

			// Clean up
			substituteCanvas.remove();
			a.remove();

			setExporting(false);
		});
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
					<button
						onClick={handleExport}
						disabled={exporting}
						aria-disabled={exporting}
					>
						<span>Export Canvas</span>
					</button>
					{exporting && <CircularProgress size={20} />}
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
