// Lib
import { useCallback, useState, memo } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import { useShallow } from "zustand/react/shallow";

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
import useStore from "../../state/hooks/useStore";

type LayerInfoProps = Layer & {
	canMoveUp: boolean;
	canMoveDown: boolean;
};

const MemoizedLayerPreview = memo(LayerPreview);

const LayerInfo: FC<LayerInfoProps> = ({
	name,
	id,
	active,
	hidden,
	canMoveUp,
	canMoveDown
}) => {
	const {
		toggleLayer,
		toggleVisibility,
		moveLayerUp,
		moveLayerDown,
		removeLayer,
		renameLayer,
		changeElementProperties
	} = useStore(
		useShallow((state) => ({
			toggleVisibility: state.toggleLayerVisibility,
			toggleLayer: state.toggleLayer,
			moveLayerDown: state.moveLayerDown,
			moveLayerUp: state.moveLayerUp,
			renameLayer: state.renameLayer,
			removeLayer: state.removeLayer,
			changeElementProperties: state.changeElementProperties
		}))
	);
	const { remove } = useIndexed();
	const { references } = useLayerReferences();
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

	const onToggle = () => toggleLayer(id);

	const onToggleVisibility = () => toggleVisibility(id);

	const onDelete = () => {
		if (!window.confirm("Are you sure you want to delete " + name + "?"))
			return;

		removeLayer(id);
		remove("layers", id);

		const elementsWithLayer = Array.from(
			document.getElementsByClassName("element")
		)
			.filter((element) => element.id === id)
			.map((element) => element.id);

		// Change the layerId of the elements to the first layer
		// if the deleted layer has any elements.
		changeElementProperties(
			(state) => ({
				...state,
				layerId: references.current[0].id
			}),
			...elementsWithLayer
		);
	};

	const onMoveLayer = (dir: "up" | "down") => {
		if (dir === "up") {
			moveLayerUp(id);
		} else {
			moveLayerDown(id);
		}
	};

	const onRename = useCallback(() => {
		setIsEditing((prev) => !prev);

		if (isEditing) {
			renameLayer({ id, newName: editedName });
			return;
		}
	}, [id, isEditing, editedName, renameLayer]);

	const visibilityTooltipText =
		!canMoveUp && !canMoveDown
			? "Two or more layers must be present to toggle."
			: hidden
				? "Show"
				: "Hide";

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
							disabled={!canMoveUp}
							onClick={() => onMoveLayer("up")}
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
							disabled={!canMoveDown}
							onClick={() => onMoveLayer("down")}
							data-testid={`down-${id}`}
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
						onDoubleClick={onRename}
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
							{/* if we cannot move up or down, then there should be only one layer; we don't want to be able to delete the layer in this case. */}
							{(canMoveUp || canMoveDown) && (
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
							{canMoveUp ||
								(canMoveDown && (
									<Tooltip
										title={visibilityTooltipText}
										arrow
										placement="top"
									>
										<button
											onClick={onToggleVisibility}
											data-testid={`toggle-${id}`}
										>
											<Eye lineCross={hidden} />
										</button>
									</Tooltip>
								))}
						</>
					)}
				</div>
			</div>
		</label>
	);
};

export default LayerInfo;
