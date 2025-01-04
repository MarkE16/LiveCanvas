// Lib
import { useState } from "react";

// Styles
import "./ElementTextField.styles.css";

// Types
import type {
	FC,
	TextareaHTMLAttributes,
	ChangeEvent,
	KeyboardEvent
} from "react";

type ElementTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const ElementTextField: FC<ElementTextFieldProps> = ({
	onChange,
	value,
	...props
}) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);

	const handleBlur = () => {
		setIsEditing(false);
	};

	const stopPropagation = (e: KeyboardEvent) => {
		if (e.key !== "Escape") {
			e.stopPropagation();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange && onChange(e);
	};

	const handleClick = () => {
		setIsEditing(true);
	};

	if (!isEditing) {
		return (
			<span
				className="element"
				onDoubleClick={handleClick}
				{...props}
			>
				{value}
			</span>
		);
	}

	return (
		<textarea
			autoFocus
			className="element"
			onBlur={handleBlur}
			onKeyDown={stopPropagation}
			onChange={handleChange}
			value={value}
			{...props}
		/>
	);
};

export default ElementTextField;
