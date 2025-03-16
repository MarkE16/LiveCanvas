// Types
import clsx from "clsx";
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
	scale: number;
	minimal: boolean;
	rotationDegrees: number;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
	setMinimal: Dispatch<SetStateAction<boolean>>;
};

const ReferenceWindowContent: FC<ReferenceWindowContentProps> = ({
	imageURL,
	flipped,
	scale,
	rotationDegrees,
	minimal,
	setImageURL,
	setMinimal
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

	const handleMinimalChange = () => {
		setMinimal((minimal) => !minimal);
	};

	const onImageLoad = () => {
		if (imageURL) {
			URL.revokeObjectURL(imageURL);
		}
	};

	const imageStyles: CSSProperties = {
		transform: `rotate(${rotationDegrees}deg) scaleX(${flipped ? -1 : 1}) scale(${scale / 50})`
	};
	const cn = clsx("reference-window-content", {
		minimal
	});

	return (
		<section
			className={cn}
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
					onClick={handleMinimalChange}
				/>
			) : (
				<p>Drop an image here to use as a reference.</p>
			)}
		</section>
	);
};

export default ReferenceWindowContent;
