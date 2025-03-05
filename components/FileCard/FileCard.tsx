// Types
import { useRef, useState } from "react";
import type { FC, MouseEvent } from "react";

// Styles
import "./FileCard.styles.css";

// Components
import { Menu, MenuItem } from "@mui/material";
import KebabMenu from "../icons/KebabMenu/KebabMenu";

type FileCardProps = {
	id: string;
	file: File;
};

const FileCard: FC<FileCardProps> = ({ file, id }) => {
	const fileURL = useRef<string>(URL.createObjectURL(file));
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLButtonElement>(
		null
	);
	const date = new Date(file.lastModified ?? 0);
	const stringDate = date.toLocaleDateString();
	const name = file.name ?? "Untitled";
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

	const handleArchive = () => {
		handleMenuClose();
		const confirmArchive = window.confirm(
			"Are you sure you want to archive this file? You can always restore it later."
		);

		if (confirmArchive) {
			// Archive the file.
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
					<a href={`/editor?f=${id}`}>
						<h3 className="file-title">{name}</h3>
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
					onClick={handleArchive}
				>
					Archive File
				</MenuItem>
			</Menu>
		</div>
	);
};

export default FileCard;
