// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";
// Redux Actions
import {
	toggleVisibility,
	toggleLayer,
	removeLayer,
	moveLayerDown,
	moveLayerUp,
	renameLayer
} from "../../state/slices/canvasSlice";

// Icons
import Eye from "../icons/Eye/Eye";
import Pen from "../icons/Pen/Pen";
import Trashcan from "../icons/Trashcan/Trashcan";
import Checkmark from "../icons/Checkmark/Checkmark";

// Types
import type { FC } from "react";
import type { Layer } from "../../types";

// Styles
import "./LayerInfo.styles.css";

// Components
import { Tooltip } from "@mui/material";
import LayerPreview from "../LayerPreview/LayerPreview";

type LayerInfoProps = Layer & {
	positionIndex: number;
};

const MemoizedLayerPreview = memo(LayerPreview);

const LayerInfo: FC<LayerInfoProps> = ({
	name,
	id,
	active,
	hidden,
	positionIndex
}) => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const totalLayers = layers.length;
	const hiddenLayers = layers.filter((layer) => layer.hidden).length;
	const dispatch = useAppDispatch();
	const references = useLayerReferences();
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

	let cn = "layer-info-container";

	if (active) {
		cn += " active";
	}

	if (isEditing) {
		cn += " editing";
	}

	const onToggle = () => dispatch(toggleLayer(id));

	const onToggleVisibility = () => dispatch(toggleVisibility(id));

	const onDelete = () => {
		if (!window.confirm("Are you sure you want to delete " + name + "?"))
			return;

		dispatch(removeLayer(id));
		remove("layers", id);
		const idx = references.findIndex((ref) => ref.id === id);
		console.log(references);
		if (idx !== -1) {
			references.splice(idx, 1);
		}

		console.log(references);
	};

	const onMoveLayer = (dir: "up" | "down") => {
		if (dir === "up") {
			dispatch(moveLayerUp(id));
		} else {
			dispatch(moveLayerDown(id));
		}
	};

	const onRename = useCallback(() => {
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

	let hiddenTooltipText = "Hide";

	if (hiddenLayers === totalLayers - 1 && !hidden) {
		hiddenTooltipText = "One layer must be visible";
	} else if (hidden) {
		hiddenTooltipText = "Show";
	}

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

			<MemoizedLayerPreview id={id} />
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
								{isEditing ? <Checkmark /> : <Pen />}
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
										<Trashcan />
									</button>
								</Tooltip>
							)}
							<Tooltip
								title={hiddenTooltipText}
								arrow
								placement="top"
							>
								<button
									onClick={onToggleVisibility}
									disabled={hiddenLayers === totalLayers - 1 && !hidden}
									data-testid={`toggle-${id}`}
								>
									<Eye lineCross={hidden} />
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
