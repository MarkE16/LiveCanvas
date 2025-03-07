// Lib
import search_logo from "../../assets/icons/search_35dp_E8EAED_FILL0_wght700_GRAD200_opsz40.svg";
import logo from "../../assets/icons/IdeaDrawnNewLogo.png";
import new_file_logo from "../../assets/icons/icons_19028.png";
import open_file_logo from "../../assets/icons/icons_515682.png";
import shared_file_logo from "../../assets/icons/icons_151918.png";
import archived_logo from "../../assets/icons/icons_417061.png";
import exclamation from "../../assets/icons/exclamation.png";
import del from "../../assets/icons/delete.svg";
import { useEffect, useRef, useState, memo } from "react";
import { navigateTo } from "../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC } from "react";
import type { Option, CanvasFile } from "../../types";

// Styles
import "./index.styles.css";
import Dropdown from "../../components/Dropdown/Dropdown";
import FileCard from "../../components/FileCard/FileCard";

export { Page };

const MemoizedFileCard = memo(FileCard);

const FILTER_OPTIONS: Option[] = [
	{
		label: "All Files",
		value: "all"
	},
	{
		label: "Alphabetical (A-Z)",
		value: "a-z"
	},
	{
		label: "Alphabetical (Z-A)",
		value: "z-a"
	},
	{
		label: "Last Active",
		value: "lastActive"
	},
	{
		label: "Date Created",
		value: "dateCreated"
	}
];

const ArchivedActions = (
	<>
		<div className="daysLeft">
			<img
				src={exclamation}
				width="20px"
				className="flip"
				alt="Info Icon"
			/>
			Archived items will be automatically deleted in 30 days.
		</div>
		<div className="con2">
			<Dropdown
				description="Sort By"
				options={FILTER_OPTIONS}
			/>
			<button
				className="empty"
				onClick={() => window.confirm("Clear?")}
			>
				<img
					src={del}
					alt="Trash Icon"
					className="flip"
					width="20px"
				/>
				Empty Archive
			</button>
		</div>
	</>
);

const BYTES_PER_MEGABYTE = 1_048_576;
const MAX_MEGABYTES = 500;
const MAX_BYTES_SIZE = BYTES_PER_MEGABYTE * MAX_MEGABYTES;

type ShownFile = {
	id: string;
	file: CanvasFile;
};

const Page: FC = () => {
	const [usedBytes, setUsedBytes] = useState<number>(0);
	const [canvases, setCanvases] = useState<ShownFile[]>([]);
	const [currentPage, setCurrentPage] = useState<"recents" | "archived">(
		"recents"
	);
	const { set, get } = useIndexed();
	const fileDialogRef = useRef<HTMLInputElement>(null);
	const barWidth = `${((usedBytes / MAX_BYTES_SIZE) * 100).toFixed(1)}%`;
	const usedMegaBytes = (usedBytes / BYTES_PER_MEGABYTE).toFixed(1);
	const pageTitle = currentPage === "recents" ? "Recent Projects" : "Archived";

	const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const file = e.target.files?.[0];

		if (!file) {
			throw new Error("No file was uploaded when opening a file.");
		}

		if (!file.name.match(/\*?.(png|jpg|jpeg)/)) {
			alert("Invalid file type.");
			return;
		}

		if (usedBytes + file.size > MAX_BYTES_SIZE) {
			// Check if the file size is within the limit.
			// If not, alert the user and return.
			alert("File size limit reached.");
			return;
		}

		const fileId = uuidv4();

		await set("files", fileId, {
			archived: false,
			archiveDate: null,
			file: new File([file], file.name, {
				type: file.type,
				lastModified: Date.now()
			})
		});
		navigateTo(`/editor?f=${fileId}&open=1`);
	};

	// Get the files to display as well as get
	// the current size accumulated by all files.
	useEffect(() => {
		async function getFilesAndSize() {
			const files = await get<[string, CanvasFile][]>("files");

			if (!files) {
				console.error("Cant update size count.");
			} else {
				let total = 0;
				const canvases = files
					.map(([id, file]) => {
						total += file.file.size;
						return { id, file };
					})
					.sort((a, b) => b.file.file.lastModified - a.file.file.lastModified);

				setUsedBytes(total);
				setCanvases(canvases);
			}
		}

		// Update the page title.
		const urlParams = new URLSearchParams(window.location.search);
		const page = urlParams.get("p");

		setCurrentPage(page === "archived" ? "archived" : "recents");

		// Get the files and their sizes.
		getFilesAndSize();
	}, [get]);

	return (
		<>
			<nav className="navbar">
				<div className="logo">
					<img
						src={logo}
						alt="Logo"
					/>
					<h1>IdeaDrawn</h1>
				</div>
				<a
					href="?p=projects"
					className="drawnspace"
				>
					DrawnSpace
				</a>
				<div className="search">
					<button className="searchbtn">
						<img
							src={search_logo}
							alt="Search Icon"
						/>
					</button>
					<input
						type="text"
						className="searchText"
						placeholder="Search IdeaDrawn"
					/>
				</div>
			</nav>
			<div className="con">
				<div className="sidebar">
					<div className="sidebarBtns">
						<button className="sidebarItem">
							<img
								src={new_file_logo}
								alt=""
								className="icons"
							/>
							<p className="sidebarItemText">New File</p>
						</button>
						<button
							className="sidebarItem"
							onClick={() => fileDialogRef.current?.click()}
						>
							<img
								src={open_file_logo}
								alt=""
								className="icons"
							/>
							<p className="sidebarItemText">Open File</p>
						</button>
						<button
							onClick={() =>
								alert("Share files in the full version of IdeaDrawn!")
							}
							className="sidebarItem"
						>
							<img
								src={shared_file_logo}
								alt=""
								className="icons"
							/>
							<p className="sidebarItemText">Shared File</p>
						</button>
						<a
							href="?p=archived"
							className="sidebarItem"
						>
							<img
								src={archived_logo}
								alt=""
								className="icons"
							/>
							<p className="sidebarItemText">Archived</p>
						</a>
					</div>
					<div className="storage-con">
						<div className="progress">
							<div
								className="bar"
								style={{ width: barWidth }}
							></div>
						</div>
						<p className="amountLeft">
							{usedMegaBytes} MB of {MAX_MEGABYTES} MB Used
						</p>
						<a
							href=""
							className="upgrade"
						>
							Upgrade to Premium
						</a>
					</div>
					<p className="copyright">
						v.0.0.1
						<br />© {new Date().getUTCFullYear()} IdeaDrawn
					</p>
				</div>
				<div className="content">
					<h1 className="title2">{pageTitle}</h1>
					{currentPage === "archived" && ArchivedActions}
					<div className="files-container">
						{canvases.length > 0 ? (
							canvases
								.filter((canvas) =>
									currentPage === "archived"
										? canvas.file.archived
										: !canvas.file.archived
								)
								.map((canvas, i) => (
									<MemoizedFileCard
										key={i}
										id={canvas.id}
										file={canvas.file}
										setCanvases={setCanvases}
									/>
								))
						) : (
							<p>No files found.</p>
						)}
					</div>
				</div>
			</div>

			{/* This is to open the file dialog. We hide it so that it's not visible. */}
			<input
				type="file"
				ref={fileDialogRef}
				onChange={onFileSelect}
				// Default types to get started with.
				// We can add more types later. That is,
				// if we can figure out how to support them.
				accept=".png,.jpg,.jpeg"
				style={{ display: "none" }}
			/>
		</>
	);
};
