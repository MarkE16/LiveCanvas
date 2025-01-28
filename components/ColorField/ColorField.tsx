// Components
import {
	ColorField as AriaColorField,
	Label,
	Input
} from "react-aria-components";

// Styles
import "./ColorField.styles.css";

// Types
import type { ChangeEvent, FC, KeyboardEvent, PropsWithChildren } from "react";

type ColorFieldProps = PropsWithChildren & {
	label: string;
	value?: string;
	onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
};

const ColorField: FC<ColorFieldProps> = ({
	label,
	value,
	onChange,
	...props
}) => {
	const stopPropagation = (e: KeyboardEvent) => e.stopPropagation();
	return (
		<AriaColorField
			className="react-aria-ColorField"
			{...props}
		>
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
