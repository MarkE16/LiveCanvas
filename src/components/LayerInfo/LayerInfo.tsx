// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { socket } from "../../_server/socket";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "@mui/material";

// Types
import { FC } from "react";

// Styles
import "./LayerInfo.styles.css";

type LayerInfoProps = {
  name: string;
  id: string;
  active: boolean;
  hidden: boolean;
  positionIndex: number;
}

const LayerInfo: FC<LayerInfoProps> = ({ name, id, active, hidden, positionIndex }) => {
  const totalLayers = useAppSelector(state => state.canvas.layers.length);
  const dispatch = useAppDispatch();
  const nameRef = useRef<HTMLSpanElement>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(name);
  const editingTooltipText = (isEditing && !editedName.length) ? "Layer name cannot be empty." :
  (isEditing) ? "Done" : "Rename";

  let cn = "layer-info-container ";

  if (active) {
    cn += " active ";
  }

  if (isEditing) {
    cn += " editing ";
  }

  const onToggle = () => {
    dispatch({ type: "TOGGLE_LAYER", payload: id });
  }

  const onToggleVisibility = () => {
    dispatch({ type: "TOGGLE_VISIBILITY", payload: id });
  }

  const onDelete = () => {
    if (!window.confirm("Are you sure you want to delete " + name + "?")) return;
    if (socket.connected) {
      socket.emit("layer-remove", id);
    }

    dispatch({ type: "REMOVE_LAYER", payload: id });
  }

  const onMoveLayer = (dir: 'up' | 'down') => {
    socket.emit("layer-move", id, dir);
    dispatch({ type: `MOVE_LAYER_${dir.toUpperCase()}`, payload: id });
  }

  const onRename = useCallback(() => {
    if (editedName.length === 0) return;
    setIsEditing(prev => !prev);

   if (isEditing) {

      dispatch({
        type: "RENAME_LAYER",
        payload: { id, name: editedName }
      });
      return;
    }
  }, [dispatch, id, isEditing, editedName]);

  useEffect(() => {
    socket.on("layer-remove", (id) => {
      dispatch({ type: "REMOVE_LAYER", payload: id });
    });

    const ref = nameRef.current;

    ref?.addEventListener("dblclick", onRename);

    return () => {
      socket.off("layer-remove");
      ref?.removeEventListener("dblclick", onRename);
    };

  }, [dispatch, onRename]);

  return (
    <label htmlFor={"layer-" + id} className={cn}>
      <input
        type="radio"
        id={"layer-" + id}
        name="layer"
        checked={active}
        onChange={onToggle}
      />
      <div className="layer-info-mover">
        <Tooltip title="Move Up" arrow placement="left">
          <button className="layer-up" onClick={() => onMoveLayer('up')} disabled={positionIndex === 0}>
            <i className="fas fa-angle-up"></i>
          </button>
        </Tooltip>
        <Tooltip title="Move Down" arrow placement="left">
          <button className="layer-down" onClick={() => onMoveLayer('down')} disabled={positionIndex === totalLayers - 1}>
            <i className="fas fa-angle-down"></i>
          </button>
        </Tooltip>
      </div>
      {
        isEditing ? (
          <input
            type="text"
            placeholder={name}
            value={editedName}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setEditedName(e.target.value);
            }}
            onBlur={onRename}
          />
        ) : (
          <span className="layer-info-name" ref={nameRef}>{name}</span>
        )
      }
      <div className="layer-info-actions">
        <Tooltip title={editingTooltipText} arrow placement="top">
          <button className="layer-rename" onClick={onRename} disabled={editedName.length === 0}>
            <i className={`fas ${isEditing ? 'fa-check' : 'fa-pencil-alt'}`}></i>
          </button>
        </Tooltip>
        {
          !isEditing && (
            <>
              <Tooltip title="Delete" arrow placement="top">
                <button className="layer-delete" onClick={onDelete}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </Tooltip>
              <Tooltip title={hidden ? "Show" : "Hide"} arrow placement="top">
                <button onClick={onToggleVisibility}>
                  <i className={`fas ${hidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </Tooltip>
            </>
          )
        }
      </div>
    </label>
  );
}

export default LayerInfo;