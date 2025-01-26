// Lib
import { useState, useRef, useEffect } from "react";
import useStore from "../../state/hooks/useStore";

// Styles
import "./ElementTextField.styles.css";

// Types
import type {
	FC,
	TextareaHTMLAttributes,
	FocusEvent,
	CSSProperties,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent
} from "react";
import type { FontProperties } from "../../types";

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
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const firstRender = useRef<boolean>(true);
	const changeElementProperties = useStore(
		(state) => state.changeElementProperties
	);
	const focusElement = useStore((state) => state.focusElement);

	const fontStyles: CSSProperties = {
		fontFamily: `${family}, sans-serif`,
		fontSize: size,
		color: fill ?? "white",
		WebkitTextStroke: `1px ${stroke ?? "black"}`,
		lineHeight: 1.5
	};

	const handleBlur = () => {
		setIsEditing(false);

		if (text.trim().length !== 0 && text !== content) {
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
		} else {
			setText(content);
		}
	};

	const onFocus = () => {
		focusElement(elementId);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== "Escape") {
			e.stopPropagation();
		} else {
			(e.currentTarget as HTMLCanvasElement).blur();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
	};

	const handleClick = () => {
		setIsEditing(true);
	};

	const handleFieldFocus = (e: FocusEvent) => {
		(e.currentTarget as HTMLTextAreaElement).select();
	};

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;

			if (focused) {
				setIsEditing(true);
			}
		}
	}, [focused]);

	if (!isEditing) {
		return (
			<span
				tabIndex={0}
				className="element"
				style={fontStyles}
				onFocus={onFocus}
				onMouseUp={stopPropagation}
				onDoubleClick={handleClick}
				data-testid="element-textpreview"
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
			onFocus={handleFieldFocus}
			onChange={handleChange}
			value={text}
			data-isediting={isEditing}
			data-testid="element-textfield"
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
