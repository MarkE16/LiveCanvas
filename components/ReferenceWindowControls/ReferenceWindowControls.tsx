// Lib
import { useRef } from "react";

// Types
import type { Dispatch, FC, SetStateAction } from "react";

type ReferenceWindowControlsProps = {
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
};

const ReferenceWindowControls: FC<ReferenceWindowControlsProps> = ({
	setImageURL
}) => {
	const fileInput = useRef<HTMLInputElement>(null);

	const onReplaceImage = () => {
		if (fileInput.current) {
			fileInput.current.click();
		}
	};

	const onFileChange = () => {
		if (fileInput.current) {
			const file = fileInput.current.files?.[0];
			if (file) {
				setImageURL(URL.createObjectURL(file));
			}
		}
	};

	return (
		<div id="reference-window-controls">
			<aside>
				<button>+</button>
				<button>-</button>
			</aside>
			<aside>
				<button onClick={onReplaceImage}>Replace with new Image</button>
			</aside>

			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				onChange={onFileChange}
				style={{ display: "none" }}
			/>
		</div>
	);
};

export default ReferenceWindowControls;
