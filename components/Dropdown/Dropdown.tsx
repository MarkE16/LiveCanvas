// Lib
import check from "../../assets/icons/check.svg";
import down from "../../assets/icons/down.svg";
import { useState } from "react";

// Types
import type { FC, MouseEvent } from "react";
import { Option } from "../../types";

// Styles
import "./Dropdown.styles.css";

type DropdownProps = {
	description: string;
	options: Option[];
	onSelect?: (option: Option) => void;
};

const Dropdown: FC<DropdownProps> = ({
	description = "Default",
	options = [],
	onSelect
}) => {
	const [selected, setSelected] = useState<Option>(options[0]);
	const [open, setOpen] = useState<boolean>(false);

	const handleSelect = (e: MouseEvent) => {
		const option = options.find(
			(option) => option.value === e.currentTarget.id
		);
		if (option) {
			setSelected(option);
			onSelect && onSelect(option);
		}
		setOpen(false);
	};

	const handleToggle = () => setOpen(!open);

	return (
		<div style={{ position: "relative" }}>
			<span className="desc">{description}:</span>
			<button
				onClick={handleToggle}
				className="currentFilter"
			>
				<span>{selected.label}</span>
				<img
					src={down}
					alt="downBtn"
					width="20px"
				/>
			</button>
			<div
				style={{
					left: description.length * 7.5 + 10
				}}
				className={`dropdownFilter${open ? " active" : ""}`}
			>
				{options.map((option) => (
					<button
						onClick={handleSelect}
						className="filter-item"
						aria-valuetext="active"
						id={option.value}
						key={option.value}
					>
						{selected.value === option.value && (
							<img
								src={check}
								width="13px"
								alt=""
								className="check"
							/>
						)}
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
};

export default Dropdown;
