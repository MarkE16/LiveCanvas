// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useRef, useState, useCallback, useEffect } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import { useShallow } from "zustand/shallow";

// Icons
import Fullscreen from "../icons/Fullscreen/Fullscreen";
import Image from "../icons/Image/Image";
import Export from "../icons/Export/Export";
import FloppyDisk from "../icons/FloppyDisk/FloppyDisk";

// Types
import type { FC, MouseEvent, ReactElement } from "react";

// Styles
import "./Navbar.styles.css";

// Components
import {
	MenuItem,
	Snackbar,
	Popper,
	Paper,
	MenuList,
	ClickAwayListener,
	ListItemIcon,
	ListItemText
} from "@mui/material";
import useStore from "../../state/hooks/useStore";
import useIndexed from "../../state/hooks/useIndexed";

const Navbar: FC = () => {
	const { prepareForExport, prepareForSave, toggleReferenceWindow } = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave,
			toggleReferenceWindow: state.toggleReferenceWindow
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
		const target = e.currentTarget as HTMLButtonElement;

		if (target.name !== "File" && target.name !== "View") {
			return;
		}
		setMenuAnchorEl(target);
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
			action: (() => void) | (() => Promise<void>);
			icon?: () => ReactElement;
		}[];
	};

	const handleSaveFile = useCallback(async () => {
		try {
			const { layers, elements } = await prepareForSave(references.current);

			const promises = [];

			// Save the layers
			layers.forEach((layer) => {
				promises.push(set("layers", layer.id, layer));
			});
			promises.push(set("elements", "items", elements));

			await Promise.all(promises);

			alert("Saved!");
		} catch (e) {
			alert("Error saving file. Reason: " + (e as Error).message);
		}
	}, [references, set, prepareForSave]);

	const handleExportFile = async () => {
		if (!downloadRef.current) throw new Error("Download ref not found");

		try {
			const blob = await prepareForExport(references.current);

			const url = URL.createObjectURL(blob);

			const a = downloadRef.current;
			a.href = url;
			a.download = "canvas.png";
			a.click();

			URL.revokeObjectURL(url);
		} catch (e) {
			alert("Error exporting file. Reason: " + (e as Error).message);
		}
	};

	const toggleFullScreen = () => {
		const doc = window.document;
		const docEl = doc.documentElement;

		if (doc.fullscreenElement) {
			doc.exitFullscreen();
		} else {
			docEl.requestFullscreen();
		}
	};

	const menuOptions: MenuOptions = {
		File: [
			{
				text: "Save File",
				action: handleSaveFile,
				icon: FloppyDisk
			},
			{
				text: "Export File",
				action: handleExportFile,
				icon: Export
			}
		],
		View: [
			{
				text: "Reference Window",
				action: toggleReferenceWindow,
				icon: Image
			},
			{
				text: "Toggle Full Screen",
				action: toggleFullScreen,
				icon: Fullscreen
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
				<img
					id="navbar-logo"
					src={logo}
					alt="logo"
				/>

				{menuTabs.map((tab) => (
					<button
						key={tab}
						name={tab}
						onMouseOver={(e) => {
							if (menuAnchorEl !== null) {
								handleMenuOpen(e);
							}
						}}
						onClick={
							tab === "File" || tab === "View" ? handleMenuOpen : openSnackbar
						}
					>
						{tab}
					</button>
				))}
			</nav>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={closeSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				message="This feature is not yet implemented."
				onClick={closeSnackbar}
			/>

			<Popper
				open={menuOpen}
				anchorEl={menuAnchorEl}
				placement="bottom-start"
				role={undefined}
				sx={{
					"& .MuiPaper-root": {
						backgroundColor: "#3b3b3b",
						color: "white"
					},
					"& .MuiMenuItem-root:hover": {
						backgroundColor: "#333" // Dark gray on hover
					},
					zIndex: 1000
				}}
			>
				<Paper>
					<ClickAwayListener onClickAway={handleMenuClose}>
						<MenuList
							autoFocusItem={menuOpen}
							id="composition-menu"
							aria-labelledby="composition-button"
							dense
							// onKeyDown={handleListKeyDown}
						>
							{menuAnchorEl &&
								menuOptions[menuAnchorEl.name].map((item, index) => {
									const iconCount = menuOptions[menuAnchorEl.name].reduce(
										(acc, curr) => (curr.icon ? acc + 1 : acc),
										0
									);
									return (
										<MenuItem
											key={index}
											onClick={() => {
												item.action();
												handleMenuClose();
											}}
										>
											{item.icon && (
												<ListItemIcon sx={{ color: "white" }}>
													<item.icon />
												</ListItemIcon>
											)}
											<ListItemText inset={!item.icon && iconCount > 0}>
												{item.text}
											</ListItemText>
										</MenuItem>
									);
								})}
						</MenuList>
					</ClickAwayListener>
				</Paper>
			</Popper>

			<a
				type="file"
				ref={downloadRef}
				style={{ display: "none" }}
				data-testid="export-link"
			/>
		</header>
	);
};

export default Navbar;
