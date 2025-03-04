// Types
import { useRef } from "react";
import type { FC } from "react";

// Styles
import "./FileCard.styles.css";

type FileCardProps = {
	id: string;
	file: File;
};

const FileCard: FC<FileCardProps> = ({ file, id }) => {
	const fileURL = useRef(URL.createObjectURL(file));
	const date = new Date(file.lastModified ?? 0);
	const stringDate = date.toLocaleDateString();
	const name = file.name ?? "Untitled";

	const onImageLoad = () => {
		URL.revokeObjectURL(fileURL.current);
	};

	return (
		<a
			className="file-card"
			href={`/editor?f=${id}`}
		>
			<img
				src={fileURL.current}
				onLoad={onImageLoad}
				alt=""
				className="file-preview"
			/>
			<div className="file-text">
				<h3 className="file-title">{name}</h3>
				<p className="file-date">
					Last Updated: <time dateTime={stringDate}>{stringDate}</time>
				</p>
			</div>
		</a>
	);
};

export default FileCard;
