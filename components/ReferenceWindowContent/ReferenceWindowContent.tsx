// Types
import type {
	FC,
	DragEvent,
	Dispatch,
	SetStateAction,
	CSSProperties
} from "react";

type ReferenceWindowContentProps = {
	imageURL: string | undefined;
	flipped: boolean;
	rotationDegrees: number;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
};

const ReferenceWindowContent: FC<ReferenceWindowContentProps> = ({
	imageURL,
	flipped,
	rotationDegrees,
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

	const imageStyles: CSSProperties = {
		transform: `rotate(${rotationDegrees}deg) scaleX(${flipped ? -1 : 1})`
	};

	return (
		<section
			id="reference-window-content"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			{imageURL ? (
				<img
					style={imageStyles}
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
