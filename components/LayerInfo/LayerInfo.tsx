// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "@mui/material";

// Redux Actions
import {
	// setLayerId,
	toggleVisibility,
	toggleLayer,
	removeLayer,
	moveLayerDown,
	moveLayerUp,
	renameLayer
} from "../../state/slices/canvasSlice";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC } from "react";
import type { Layer } from "../../types";

// Styles
import "./LayerInfo.styles.css";

type LayerInfoProps = Layer & {
	positionIndex: number;
};

const LayerInfo: FC<LayerInfoProps> = ({
	name,
	id,
	active,
	hidden,
	positionIndex
}) => {
	const totalLayers = useAppSelector((state) => state.canvas.layers.length);
	const dispatch = useAppDispatch();
	const nameRef = useRef<HTMLSpanElement>(null);
	const { remove } = useIndexed();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editedName, setEditedName] = useState<string>(name);
	const editingTooltipText =
		isEditing && !editedName.length
			? "Layer name cannot be empty."
			: isEditing
				? "Done"
				: "Rename";

	let cn = "layer-info-container ";

	if (active) {
		cn += " active ";
	}

	if (isEditing) {
		cn += " editing ";
	}

	const onToggle = () => dispatch(toggleLayer(id));

	const onToggleVisibility = () => dispatch(toggleVisibility(id));

	const onDelete = () => {
		if (!window.confirm("Are you sure you want to delete " + name + "?"))
			return;

		dispatch(removeLayer(id));
		remove("layers", id);
	};

	const onMoveLayer = (dir: "up" | "down") => {
		if (dir === "up") {
			dispatch(moveLayerUp(id));
		} else {
			dispatch(moveLayerDown(id));
		}
	};

	const onRename = useCallback(() => {
		if (editedName.length === 0) return;
		setIsEditing((prev) => !prev);

		if (isEditing) {
			dispatch(renameLayer({ id, newName: editedName }));
			return;
		}
	}, [dispatch, id, isEditing, editedName]);

	useEffect(() => {
		const ref = nameRef.current;

		if (!ref) return;

		ref.addEventListener("dblclick", onRename);

		return () => {
			ref.removeEventListener("dblclick", onRename);
		};
	}, [dispatch, onRename]);

	return (
		<label
			htmlFor={"layer-" + id}
			data-testid={"layer-" + id}
			className={cn}
			aria-label={"Layer " + id}
		>
			<input
				type="radio"
				id={"layer-" + id}
				name="layer"
				checked={active}
				onChange={onToggle}
			/>
			<div className="layer-info-mover">
				<Tooltip
					title="Move Up"
					arrow
					placement="left"
				>
					<span>
						<button
							className="layer-up"
							data-testid={`up-${id}`}
							onClick={() => onMoveLayer("up")}
							disabled={positionIndex === 0}
						>
							<i className="fas fa-angle-up"></i>
						</button>
					</span>
				</Tooltip>
				<Tooltip
					title="Move Down"
					arrow
					placement="left"
				>
					<span>
						<button
							className="layer-down"
							onClick={() => onMoveLayer("down")}
							data-testid={`down-${id}`}
							disabled={positionIndex === totalLayers - 1}
						>
							<i className="fas fa-angle-down"></i>
						</button>
					</span>
				</Tooltip>
			</div>
			<div className="layer-info-actions">
				{isEditing ? (
					<input
						type="text"
						data-testid={`name-input-${id}`}
						placeholder={name}
						value={editedName}
						/**
					We add this keydown event so that we prevent the keydown event attached on the
					window object from firing (for listening to keyboard shortcuts related to tools)
					when we are editing the layer name.
				  */
						onKeyDown={(e) => {
							e.stopPropagation();

							if (e.key === "Enter" && isEditing) {
								onRename();
							} else if (e.key === "Escape" && isEditing) {
								setIsEditing(false);
							}
						}}
						onChange={(e) => {
							setEditedName(e.target.value);
						}}
						onBlur={onRename}
					/>
				) : (
					<span
						className="layer-info-name"
						data-testid={`name-${id}`}
						ref={nameRef}
					>
						{name}
					</span>
				)}
				<div>
					<Tooltip
						title={editingTooltipText}
						arrow
						placement="top"
					>
						<span>
							<button
								className="layer-rename"
								onClick={onRename}
								data-testid={`rename-${id}`}
								disabled={!editedName.length}
							>
								<i
									className={`fas ${isEditing ? "fa-check" : "fa-pencil-alt"}`}
								></i>
							</button>
						</span>
					</Tooltip>
					{!isEditing && (
						<>
							{totalLayers > 1 && (
								<Tooltip
									title="Delete"
									arrow
									placement="top"
								>
									<button
										className="layer-delete"
										data-testid={`del-${id}`}
										onClick={onDelete}
									>
										<i className="fas fa-trash-alt"></i>
									</button>
								</Tooltip>
							)}
							<Tooltip
								title={hidden ? "Show" : "Hide"}
								arrow
								placement="top"
							>
								<button
									onClick={onToggleVisibility}
									data-testid={`toggle-${id}`}
								>
									<i
										className={`fas ${hidden ? "fa-eye-slash" : "fa-eye"}`}
									></i>
								</button>
							</Tooltip>
						</>
					)}
				</div>
			</div>
		</label>
	);
};

export default LayerInfo;
