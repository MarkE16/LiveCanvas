// Types
import { useRef } from "react";
import type { FC } from "react";

// Styles
import "./FileCard.styles.css";

type FileCardProps = {
	title?: string;
	lastUpdated?: string;
	id: string;
	file: File;
};

const FileCard: FC<FileCardProps> = ({
	title = "Title",
	lastUpdated = "1/10/2000",
	file,
	id
}) => {
	const fileURL = useRef(URL.createObjectURL(file));

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
				<h3 className="file-title">{title}</h3>
				<p className="file-date">
					Last Updated: <time dateTime="2000-1-10">{lastUpdated}</time>
				</p>
			</div>
		</a>
	);
};

export default FileCard;
