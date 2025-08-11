// Lib
import logo from "@/assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useRef, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import useStore from "@/state/hooks/useStore";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";

// Icons
import Fullscreen from "@/components/icons/Fullscreen/Fullscreen";
import Image from "@/components/icons/Image/Image";
import Export from "@/components/icons/Export/Export";
import FloppyDisk from "@/components/icons/FloppyDisk/FloppyDisk";
import Close from "@/components/icons/Close/Close";

// Types
import type { ComponentProps, ReactElement, ReactNode } from "react";

// Components
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarTrigger,
	MenubarMenu,
	MenubarPortal,
	MenubarShortcut
} from "@/components/ui/menubar";
import NavbarFileSaveStatus from "../NavbarFileSaveStatus/NavbarFileSaveStatus";
import ZoomIn from "../icons/ZoomIn/ZoomIn";
import { detectOperatingSystem } from "@/lib/utils";
import ZoomOut from "../icons/ZoomOut/ZoomOut";

function Navbar(): ReactNode {
	const {
		prepareForExport,
		prepareForSave,
		toggleReferenceWindow,
		increaseScale,
		decreaseScale
	} = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave,
			toggleReferenceWindow: state.toggleReferenceWindow,
			increaseScale: state.increaseScale,
			decreaseScale: state.decreaseScale
		}))
	);
	const downloadRef = useRef<HTMLAnchorElement>(null);
	const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">(
		"saved"
	);
	const menuTabs = ["File", "Edit", "View", "Filter", "Admin"];

	type MenuOptions = {
		[key: string]: {
			text: string;
			action: (() => void) | (() => Promise<void>);
			icon?: (props: ComponentProps<"svg">) => ReactElement;
			shortcut?: string;
		}[];
	};

	const handleSaveFile = useCallback(async () => {
		try {
			setSaveStatus("saving");
			const { layers, elements } = prepareForSave();

			if (layers.length === 0) {
				throw new Error("No layers to save. This is a bug.");
			}

			const promises = [];

			promises.push(
				LayersStore.upsertLayers(
					layers.map((layer, i) => ({
						...layer,
						position: i
					}))
				),
				ElementsStore.addElements(elements)
			);

			await Promise.all(promises);

			setSaveStatus("saved");
		} catch (e) {
			alert("Error saving file. Reason: " + (e as Error).message);
		}
	}, [prepareForSave]);

	const handleExportFile = async () => {
		if (!downloadRef.current) throw new Error("Download ref not found");

		try {
			const blob = await prepareForExport();

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
				icon: FloppyDisk,
				shortcut: "S"
			},
			{
				text: "Export File",
				action: handleExportFile,
				icon: Export
			}
		],
		View: [
			{
				text: "Zoom In",
				action: increaseScale,
				icon: ZoomIn,
				shortcut: "Plus"
			},
			{
				text: "Zoom Out",
				action: decreaseScale,
				icon: ZoomOut,
				shortcut: "Minus"
			},
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
			<nav className="flex items-center p-[0.2rem] min-h-[3rem] h-[3rem] border-b border-b-[#d1836a] w-full whitespace-nowrap">
				<img
					className="w-[3rem] h-[3rem] mr-2"
					src={logo}
					alt="logo"
				/>

				<Menubar className="flex items-center mr-2">
					{menuTabs.map((tab) => {
						const options = menuOptions[tab];
						let content;
						if (!options || options.length === 0) {
							content = (
								<MenubarItem>
									<span className="mr-[2px]">
										<Close />
									</span>
									No options available
								</MenubarItem>
							);
						} else {
							const shortcutKey =
								detectOperatingSystem() === "MacOS" ? "⌘" : "Ctrl";
							content = options.map((option) => {
								return (
									<MenubarItem
										key={option.text}
										onClick={option.action}
									>
										{option.icon && (
											<span className="mr-[2px]">
												<option.icon />
											</span>
										)}
										{option.text}
										{option.shortcut && (
											<MenubarShortcut>
												{shortcutKey}+{option.shortcut}
											</MenubarShortcut>
										)}
									</MenubarItem>
								);
							});
						}
						return (
							<MenubarMenu key={tab}>
								<MenubarTrigger className="text-[1.1em] font-medium text-[#fdfdfd] cursor-pointer">
									{tab}
								</MenubarTrigger>
								<MenubarPortal>
									<MenubarContent
										className="z-[1000] min-w-[200px] bg-[#242424] rounded-md border border-[#3e3e3e] p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]"
										align="start"
									>
										{content}
									</MenubarContent>
								</MenubarPortal>
							</MenubarMenu>
						);
					})}
				</Menubar>

				<NavbarFileSaveStatus status={saveStatus} />
			</nav>

			<a
				type="file"
				ref={downloadRef}
				style={{ display: "none" }}
				data-testid="export-link"
			/>
		</header>
	);
}

export default Navbar;
