// Lib
import { useRef, useState } from "react";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC, MouseEvent } from "react";
import type { CanvasFile } from "../../types";

// Styles
import "./FileCard.styles.css";

// Components
import { Menu, MenuItem } from "@mui/material";
import KebabMenu from "../icons/KebabMenu/KebabMenu";

type ShownFile = {
	id: string;
	file: CanvasFile;
};

type FileCardProps = {
	id: string;
	file: CanvasFile;
	setCanvases: React.Dispatch<React.SetStateAction<ShownFile[]>>;
};

const FileCard: FC<FileCardProps> = ({ file, id, setCanvases }) => {
	const fileURL = useRef<string>(URL.createObjectURL(file.file));
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLButtonElement>(
		null
	);
	const { set } = useIndexed();
	const date = new Date(file.file.lastModified ?? 0);
	const stringDate = date.toLocaleDateString();
	const name = file.file.name ?? "Untitled";
	const menuOpen = Boolean(menuAnchorEl);

	const handleMenuOpen = (e: MouseEvent) => {
		setMenuAnchorEl(e.currentTarget as HTMLButtonElement);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	const onImageLoad = () => {
		URL.revokeObjectURL(fileURL.current);
	};

	const handleAction = async () => {
		handleMenuClose();
		const question = file.archived
			? "Are you sure you want to restore this file?"
			: "Are you sure you want to archive this file? You can always restore it later.";
		const confirmArchive = window.confirm(question);

		if (confirmArchive) {
			// Toggle the archive status of the file.
			const newFile = {
				file: file.file,
				archived: !file.archived,
				archivedDate: file.archived ? null : Date.now()
			};
			await set<CanvasFile>("files", id, newFile);

			// Update the canvases to reflect the change.

			setCanvases((canvases) => {
				const index = canvases.findIndex((canvas) => canvas.id === id);
				const newCanvases = [...canvases];
				newCanvases[index] = {
					id,
					file: newFile
				};
				return newCanvases;
			});
		}
	};

	return (
		<div className="file-card">
			<a href={`/editor?f=${id}`}>
				<img
					src={fileURL.current}
					onLoad={onImageLoad}
					alt={name}
					className="file-preview"
				/>
			</a>
			<div className="file-text">
				<div className="interactive-file-options">
					<a
						href={`/editor?f=${id}`}
						className="file-title"
					>
						{name}
					</a>

					<button
						onClick={handleMenuOpen}
						className="file-options"
						aria-label="File Options"
					>
						<KebabMenu />
					</button>
				</div>
				<p className="file-date">
					Last Updated: <time dateTime={stringDate}>{stringDate}</time>
				</p>
			</div>

			<Menu
				open={menuOpen}
				anchorEl={menuAnchorEl}
				onClose={handleMenuClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left"
				}}
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
				<MenuItem
					dense
					onClick={handleAction}
				>
					{file.archived ? "Restore" : "Archive"} File
				</MenuItem>
			</Menu>
		</div>
	);
};

export default FileCard;
