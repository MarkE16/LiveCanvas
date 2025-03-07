// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useState } from "react";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC, MouseEvent } from "react";

// Styles
import "./Navbar.styles.css";

// Components
import ExportCanvasButton from "../ExportCanvasButton/ExportCanvasButton";
import SaveCanvasButton from "../SaveCanvasButton/SaveCanvasButton";
import { Menu, MenuItem, Snackbar, Fade } from "@mui/material";
import { CanvasFile } from "../../types";

const Navbar: FC = () => {
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLButtonElement>(
		null
	);
	const { set, get } = useIndexed();
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

	const menuOptions: MenuOptions = {
		File: [
			{
				text: "Rename File",
				action: async () => {
					const urlParams = new URLSearchParams(window.location.search);
					const fileID = urlParams.get("f");

					if (!fileID) {
						throw new Error("No file ID found in URL.");
					}

					const file = await get<CanvasFile>("files", fileID);

					if (!file) {
						throw new Error("File not found.");
					}

					const newName = window.prompt("Enter new file name", file.file.name);

					if (!newName) {
						return;
					}

					if (newName.trim().length === 0) {
						return;
					}

					await set("files", fileID, new File([file.file.name], newName));
				}
			}
		]
	};

	return (
		<header data-testid="nav-bar">
			<nav id="navbar-container">
				<section id="navbar-links-section">
					<a href="/home">
						<img
							id="navbar-logo"
							src={logo}
							alt="logo"
						/>
					</a>
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
				<section id="navbar-buttons-section">
					<SaveCanvasButton />
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
