// Styles
import "./FileTemplatePreview.styles.css";

// Types
import type { CSSProperties, FC } from "react";

type FileTemplatePreviewProps = {
	width: number;
	height: number;
};

const FileTemplatePreview: FC<FileTemplatePreviewProps> = ({
	width,
	height
}) => {
	const styles: CSSProperties = {
		width,
		height
	};

	return (
		<div
			className="file-template-preview"
			style={styles}
		>
			<div className="file-template-preview__content">
				<div className="file-template-preview__content__title">
					Template Preview
				</div>
				<div className="file-template-preview__content__dimensions">
					{width} x {height}
				</div>
			</div>
		</div>
	);
};

export default FileTemplatePreview;
