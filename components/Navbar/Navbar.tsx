// Lib
import logo from "../../assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useRef, useCallback, useEffect } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import { useShallow } from "zustand/shallow";
import useStore from "../../state/hooks/useStore";
import useIndexed from "../../state/hooks/useIndexed";

// Icons
import Fullscreen from "../icons/Fullscreen/Fullscreen";
import Image from "../icons/Image/Image";
import Export from "../icons/Export/Export";
import FloppyDisk from "../icons/FloppyDisk/FloppyDisk";

// Types
import type { FC, ReactElement } from "react";

// Styles
import "./Navbar.styles.css";

// Components
import * as Menubar from "@radix-ui/react-menubar";

const Navbar: FC = () => {
	const { prepareForExport, prepareForSave, toggleReferenceWindow } = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave,
			toggleReferenceWindow: state.toggleReferenceWindow
		}))
	);
	const { set } = useIndexed();
	const downloadRef = useRef<HTMLAnchorElement>(null);
	const { references } = useLayerReferences();

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

				<Menubar.Root className="MenubarRoot">
					{menuTabs.map((tab) => {
						return (
							<Menubar.Menu key={tab}>
								<Menubar.Trigger className="MenubarTrigger">
									{tab}
								</Menubar.Trigger>
								<Menubar.Portal>
									<Menubar.Content
										className="MenubarContent"
										align="start"
									>
										{(menuOptions[tab] ?? []).map((option) => (
											<Menubar.Item
												key={option.text}
												className="MenubarItem"
												onClick={option.action}
											>
												{option.icon && <option.icon />}
												{option.text}
											</Menubar.Item>
										))}
									</Menubar.Content>
								</Menubar.Portal>
							</Menubar.Menu>
						);
					})}
				</Menubar.Root>
			</nav>

			{/* <Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={closeSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				message="This feature is not yet implemented."
				onClick={closeSnackbar}
			/> */}

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
