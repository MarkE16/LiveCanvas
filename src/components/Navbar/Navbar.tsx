// Lib
import logo from "@/assets/icons/IdeaDrawnNewLogo_transparent.png";
import { useRef, useCallback, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import useStore from "@/state/hooks/useStore";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";

// Icons
import Fullscreen from "@/components/icons/Fullscreen/Fullscreen";
import Image from "@/components/icons/Image/Image";
import Export from "@/components/icons/Export/Export";
import FloppyDisk from "@/components/icons/FloppyDisk/FloppyDisk";

// Types
import type { ComponentProps, ReactElement, ReactNode } from "react";

// Components
import * as Menubar from "@radix-ui/react-menubar";
import Tooltip from "../Tooltip/Tooltip";

function Navbar(): ReactNode {
	const { prepareForExport, prepareForSave, toggleReferenceWindow } = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave,
			toggleReferenceWindow: state.toggleReferenceWindow
		}))
	);
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const menuTabs = ["File", "Edit", "View", "Filter", "Admin"];

	type MenuOptions = {
		[key: string]: {
			text: string;
			action: (() => void) | (() => Promise<void>);
			icon?: (props: ComponentProps<"svg">) => ReactElement;
		}[];
	};

	const handleSaveFile = useCallback(async () => {
		try {
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

			alert("Saved!");
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
			<nav className="flex items-center p-[0.2rem] min-h-[3rem] h-[3rem] border-b border-b-[#d1836a] w-full whitespace-nowrap">
				<img
					className="w-[3rem] h-[3rem] mr-2"
					src={logo}
					alt="logo"
				/>

				<Menubar.Root className="flex items-center">
					{menuTabs.map((tab) => {
						if (!menuOptions[tab]) {
							return (
								<Tooltip
									text="Not available"
									key={tab}
								>
									<span
										className="mr-[0.8rem] text-[1.1em] font-medium text-[#fdfdfd] border-b-2 border-transparent no-underline bg-transparent cursor-default"
										key={tab}
									>
										{tab}
									</span>
								</Tooltip>
							);
						}

						return (
							<Menubar.Menu key={tab}>
								<Menubar.Trigger className="mr-[0.8rem] text-[1.1em] font-medium text-[#fdfdfd] cursor-pointer">
									{tab}
								</Menubar.Trigger>
								<Menubar.Portal>
									<Menubar.Content
										className="z-[1000] min-w-[200px] bg-[#242424] rounded-md border border-[#3e3e3e] p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]"
										align="start"
									>
										{menuOptions[tab].map((option) => (
											<Menubar.Item
												key={option.text}
												className="font-normal text-sm leading-none text-[#fdfdfd] rounded py-[10px] px-[10px] flex items-center h-[25px] relative select-none data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-[#d1836a] data-[highlighted]:to-[#d1836a] data-[highlighted]:text-white data-[disabled]:text-gray-500 data-[disabled]:pointer-events-none"
												onClick={option.action}
											>
												{option.icon && (
													<span className="text-lg mr-[10px]">
														<option.icon />
													</span>
												)}
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
