// Types
import type { FC } from "react";

// Styles
import "./FileCard.styles.css";

type FileCardProps = {
	title?: string;
	lastUpdated?: string;
	id: string;
};

const FileCard: FC<FileCardProps> = ({
	title = "Title",
	lastUpdated = "1/10/2000",
	id
}) => {
	return (
		<a
			className="file-card"
			href={`/editor?f=${id}`}
		>
			<img
				src=""
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
