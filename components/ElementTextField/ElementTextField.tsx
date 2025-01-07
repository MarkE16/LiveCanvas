// Lib
import { useState, useEffect, useRef } from "react";
import useStore from "../../state/hooks/useStore";

// Styles
import "./ElementTextField.styles.css";

// Types
import type {
	FC,
	TextareaHTMLAttributes,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent
} from "react";
import type { FontProperties } from "../../types";
import { CSSProperties } from "@mui/material/styles/createTypography";

type ElementTextFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	properties: FontProperties;
	fill?: string;
	stroke?: string;
	elementId: string;
	focused: boolean;
};

const ElementTextField: FC<ElementTextFieldProps> = ({
	properties: { content, family, size },
	fill,
	stroke,
	elementId,
	focused = false,
	...props
}) => {
	const [text, setText] = useState<string>(content);
	const [isEditing, setIsEditing] = useState<boolean>(() => focused);
	const firstRender = useRef<boolean>(true);
	const changeElementProperties = useStore(
		(state) => state.changeElementProperties
	);
	const focusElement = useStore((state) => state.focusElement);

	const fontStyles: CSSProperties = {
		fontFamily: `${family}, sans-serif`,
		fontSize: size,
		color: fill ?? "white",
		WebkitTextStroke: `1px ${stroke ?? "black"}`
	};

	const handleBlur = (e: FocusEvent) => {
		if (firstRender.current) {
			firstRender.current = false;

			(e.target as HTMLTextAreaElement).focus();
			return;
		}

		setIsEditing(false);
		changeElementProperties(
			(state) => ({
				...state,
				text: {
					...state.text!,
					content: text
				}
			}),
			elementId
		);
	};

	const onFocus = () => {
		focusElement(elementId);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== "Escape") {
			e.stopPropagation();
		} else {
			setText(content);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
	};

	const handleClick = () => {
		setIsEditing(true);
	};

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	if (!isEditing) {
		return (
			<span
				tabIndex={0}
				className="element"
				style={fontStyles}
				onFocus={onFocus}
				onMouseUp={stopPropagation}
				onDoubleClick={handleClick}
				data-testid="element"
				data-focused={focused}
				data-type="text"
				data-font-family={family}
				data-font-size={size}
				data-font-content={content}
				data-fill={fill}
				data-stroke={stroke}
				{...props}
			>
				{text}
			</span>
		);
	}

	return (
		<textarea
			autoFocus
			spellCheck={false}
			className="element"
			style={fontStyles}
			onBlur={handleBlur}
			onKeyDown={onKeyDown}
			onMouseUp={stopPropagation}
			onChange={handleChange}
			value={text}
			data-isediting={isEditing}
			data-testid="element"
			data-focused={focused}
			data-type="text"
			data-font-family={family}
			data-font-size={size}
			data-font-content={content}
			data-fill={fill}
			data-stroke={stroke}
			{...props}
		/>
	);
};

export default ElementTextField;
