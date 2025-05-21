// Lib
import { useState, useRef, useEffect } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type {
	ReactNode,
	TextareaHTMLAttributes,
	FocusEvent,
	CSSProperties,
	ChangeEvent,
	KeyboardEvent,
	MouseEvent
} from "react";
import type { FontProperties } from "@/types";

type ElementTextFieldProps = Readonly<
	TextareaHTMLAttributes<HTMLTextAreaElement> & {
		properties: FontProperties;
		fill?: string;
		stroke?: string;
		elementId: string;
		focused: boolean;
	}
>;

function ElementTextField({
	properties: { content, family, size },
	fill,
	stroke,
	elementId,
	focused = false,
	...props
}: ElementTextFieldProps): ReactNode {
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
				(element) => element.id === elementId
			);
		} else {
			setText(content);
		}
	};

	const onFocus = () => {
		focusElement((element) => element.id === elementId);
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
				className="inline-block w-full h-full min-w-[20px] border-none break-all whitespace-pre-wrap outline-none resize-none bg-transparent overflow-hidden caret-black -mt-[1px] p-0 align-text-top leading-[1.5]"
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
			className="inline-block w-full h-full min-w-[20px] border-none break-all whitespace-pre-wrap outline-none resize-none bg-transparent overflow-hidden caret-black -mt-[1px] p-0 align-text-top leading-[1.5] text-[1em] text-white"
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
}

export default ElementTextField;
