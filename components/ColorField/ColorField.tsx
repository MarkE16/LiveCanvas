// Components
import {
	ColorField as AriaColorField,
	Label,
	Input
} from "react-aria-components";

// Styles
import "./ColorField.styles.css";

// Types
import type { ChangeEvent, FC, KeyboardEvent } from "react";

type ColorFieldProps = {
	label: string;
	value?: string;
	onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
};

const ColorField: FC<ColorFieldProps> = ({ label, value, onChange }) => {
	const stopPropagation = (e: KeyboardEvent) => e.stopPropagation();
	return (
		<AriaColorField className="react-aria-ColorField">
			<Label>{label}</Label>
			<Input
				type="text"
				value={value}
				className="react-aria-Input"
				onChange={onChange}
				onKeyDown={stopPropagation}
			/>
		</AriaColorField>
	);
};

export default ColorField;
