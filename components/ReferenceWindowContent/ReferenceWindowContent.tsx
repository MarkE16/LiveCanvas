// Types
import type { FC, DragEvent, Dispatch, SetStateAction } from "react";

type ReferenceWindowContentProps = {
	imageURL: string | undefined;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
};

const ReferenceWindowContent: FC<ReferenceWindowContentProps> = ({
	imageURL,
	setImageURL
}) => {

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();

		const files = e.dataTransfer.files;

		if (!files.length) return;

		const file = files[0];

		if (!file.type.match(/\*?.(png|jpg|jpeg)/)) {
			alert("Invalid file type.");
			return;
		}

		setImageURL(URL.createObjectURL(file));
	}

	const onImageLoad = () => {
		if (imageURL) {
			URL.revokeObjectURL(imageURL);
		}
	};

	return (
		<section
			id="reference-window-content"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			{imageURL ? (
				<img
					id="reference-image"
					src={imageURL}
					alt="Reference"
					onLoad={onImageLoad}
				/>
			) : (
				<p>Drop an image here to use as a reference.</p>
			)}
		</section>
	);
};

export default ReferenceWindowContent;
