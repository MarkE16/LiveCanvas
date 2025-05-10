// Lib
import { useState, memo } from "react";
import clsx from "clsx";
import useStore from "@state/hooks/useStore";
import useLayerReferences from "@state/hooks/useLayerReferences";
import { useShallow } from "zustand/react/shallow";
import LayersStore from "src/state/stores/LayersStore";

// Icons
import Eye from "@components/icons/Eye/Eye";
import Pen from "@components/icons/Pen/Pen";
import Trashcan from "@components/icons/Trashcan/Trashcan";
import Checkmark from "@components/icons/Checkmark/Checkmark";

// Types
import type { ReactNode } from "react";
import type { Layer } from "src/types";

// Styles
import "./LayerInfo.styles.css";

// Components
import LayerPreview from "@components/LayerPreview/LayerPreview";
import Tooltip from "@components/Tooltip/Tooltip";

type LayerInfoProps = Readonly<
	Layer & {
		canMoveUp: boolean;
		canMoveDown: boolean;
		idx: number;
	}
>;

const MemoizedLayerPreview = memo(LayerPreview);

function LayerInfo({
	name,
	id,
	active,
	hidden,
	canMoveUp,
	canMoveDown,
	idx
}: LayerInfoProps): ReactNode {
	const {
		toggleLayer,
		toggleVisibility,
		moveLayerUp,
		moveLayerDown,
		removeLayer,
		renameLayer,
		deleteElement
	} = useStore(
		useShallow((state) => ({
			toggleVisibility: state.toggleLayerVisibility,
			toggleLayer: state.toggleLayer,
			moveLayerDown: state.moveLayerDown,
			moveLayerUp: state.moveLayerUp,
			renameLayer: state.renameLayer,
			removeLayer: state.removeLayer,
			deleteElement: state.deleteElement
		}))
	);
	const { setActiveIndex } = useLayerReferences();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editedName, setEditedName] = useState<string>(name);
	const editingTooltipText =
		isEditing && !editedName.length
			? "Layer name cannot be empty."
			: isEditing
				? "Done"
				: "Rename";

	const cn = clsx("layer-info-container", {
		active,
		hidden
	});

	const onToggle = () => {
		toggleLayer(id);
		setActiveIndex(idx);
	};

	const onToggleVisibility = () => toggleVisibility(id);

	const onDelete = () => {
		if (!window.confirm("Are you sure you want to delete " + name + "?"))
			return;

		removeLayer(id);
		
    LayersStore.removeLayer([id]);

		deleteElement(element => element.layerId === id);
	};

	const onMoveLayer = (dir: "up" | "down") => {
		if (dir === "up") {
			moveLayerUp(id);
		} else {
			moveLayerDown(id);
		}
	};

	const onRename = () => {
		setIsEditing((prev) => !prev);

		if (isEditing) {
			if (!editedName.length) {
				console.error("Layer name cannot be empty.");
				setEditedName(name);
				return;
			}

			renameLayer({ id, newName: editedName });
			return;
		}
	};

	const visibilityTooltipText = hidden ? "Show" : "Hide";

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
					text="Move Up"
					position="left"
				>
					<button
						className="layer-up"
						data-testid={`up-${id}`}
						onClick={() => onMoveLayer("up")}
					>
						<i className="fas fa-angle-up"></i>
					</button>
				</Tooltip>
				<Tooltip
					text="Move Down"
					position="left"
				>
					<button
						className="layer-down"
						onClick={() => onMoveLayer("down")}
						data-testid={`down-${id}`}
					>
						<i className="fas fa-angle-down"></i>
					</button>
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
					<div className="layer-info-text">
						<span
							className="layer-info-name"
							data-testid={`name-${id}`}
							onDoubleClick={onRename}
						>
							{name}
						</span>
					</div>
				)}
				<div>
					<Tooltip text={editingTooltipText}>
						<button
							className="layer-rename"
							onClick={onRename}
							data-testid={`rename-${id}`}
							disabled={!editedName.length}
						>
							{isEditing ? <Checkmark /> : <Pen />}
						</button>
					</Tooltip>
					{!isEditing && (
						<>
							{/* if we cannot move up or down, then there should be only one layer; we don't want to be able to delete the layer in this case. */}
							{(canMoveUp || canMoveDown) && (
								<Tooltip text="Delete">
									<button
										className="layer-delete"
										data-testid={`del-${id}`}
										onClick={onDelete}
									>
										<Trashcan />
									</button>
								</Tooltip>
							)}

							<Tooltip text={visibilityTooltipText}>
								<button
									onClick={onToggleVisibility}
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
}

export default LayerInfo;
