// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useRef, useState, useCallback, useEffect } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import { useShallow } from "zustand/shallow";

// Types
import type { FC, MouseEvent } from "react";

// Styles
import "./Navbar.styles.css";

// Components
import { Menu, MenuItem, Snackbar, Fade } from "@mui/material";
import useStore from "../../state/hooks/useStore";
import useIndexed from "../../state/hooks/useIndexed";

const Navbar: FC = () => {
	const { prepareForExport, prepareForSave } = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave
		}))
	);
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLButtonElement>(
		null
	);
	const { set } = useIndexed();
	const downloadRef = useRef<HTMLAnchorElement>(null);
	const { references } = useLayerReferences();
	const menuOpen = Boolean(menuAnchorEl);

	const handleMenuOpen = (e: MouseEvent) => {
		setMenuAnchorEl(e.currentTarget as HTMLButtonElement);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	const openSnackbar = () => {
		setSnackbarOpen(true);
	};

	const closeSnackbar = () => {
		setSnackbarOpen(false);
	};

	const menuTabs = ["File", "Edit", "View", "Filter", "Admin"];

	type MenuOptions = {
		[key: string]: {
			text: string;
			action: () => void;
		}[];
	};

	const handleSaveFile = useCallback(async () => {
		if (!references.current.length)
			throw new Error(
				"Cannot export canvas: no references found. This is a bug."
			);

		const { layers, elements } = await prepareForSave(references.current);

		const promises = [];

		// Save the layers
		layers.forEach((layer) => {
			promises.push(set("layers", layer.id, layer));
		});
		promises.push(set("elements", "items", elements));

		await Promise.all(promises);

		alert("Saved!");
	}, [references, set, prepareForSave]);

	const handleExportFile = async () => {
		if (!downloadRef.current) throw new Error("Download ref not found");

		const blob = await prepareForExport(references.current);

		const url = URL.createObjectURL(blob);

		const a = downloadRef.current;
		a.href = url;
		a.download = "canvas.png";
		a.click();

		URL.revokeObjectURL(url);
	};

	const menuOptions: MenuOptions = {
		File: [
			{
				text: "Save File",
				action: handleSaveFile
			},
			{
				text: "Export File",
				action: handleExportFile
			}
		]
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "s" && e.ctrlKey) {
				e.preventDefault();
				handleSaveFile();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleSaveFile]);

	return (
		<header data-testid="nav-bar">
			<nav id="navbar-container">
				<section id="navbar-links-section">
					<img
						id="navbar-logo"
						src={logo}
						alt="logo"
					/>
					<div id="navbar-links">
						{menuTabs.map((tab) => (
							<button
								key={tab}
								name={tab}
								onClick={tab === "File" ? handleMenuOpen : openSnackbar}
							>
								{tab}
							</button>
						))}

						<Menu
							open={menuOpen}
							anchorEl={menuAnchorEl}
							onClose={handleMenuClose}
							TransitionComponent={Fade}
							transitionDuration={200}
							variant="menu"
							sx={{
								"& .MuiPaper-root": {
									backgroundColor: "#3b3b3b",
									color: "white"
								},
								"& .MuiMenuItem-root:hover": {
									backgroundColor: "#333" // Dark gray on hover
								}
							}}
						>
							{menuAnchorEl &&
								menuOptions[menuAnchorEl.name].map((option) => (
									<MenuItem
										key={option.text}
										onClick={() => {
											option.action();
											handleMenuClose();
										}}
									>
										{option.text}
									</MenuItem>
								))}
						</Menu>
					</div>
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

			<a
				type="file"
				ref={downloadRef}
				style={{ display: "none" }}
			/>
		</header>
	);
};

export default Navbar;
