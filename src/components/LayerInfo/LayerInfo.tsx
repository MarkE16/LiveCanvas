// Lib
import { useAppDispatch } from "../../state/hooks/reduxHooks";
import { socket } from "../../server/socket";
import { useEffect } from "react";

// Types
import { FC } from "react";

type LayerInfoProps = {
  name: string;
  id: string;
  active: boolean;
}

const LayerInfo: FC<LayerInfoProps> = ({ name, id, active }) => {
  const dispatch = useAppDispatch();

  const onToggle = () => {
    dispatch({ type: "TOGGLE_LAYER", payload: id });
  }

  const onDelete = () => {
    socket.emit("layer-remove", id);
  }

  const onMoveLayer = (dir: 'up' | 'down') => {
    socket.emit("layer-move", id, dir);
  }

  useEffect(() => {
    socket.on("layer-remove", (id) => {
      dispatch({ type: "REMOVE_LAYER", payload: id });
    });

    socket.on("layer-move", (id, dir) => {
      console.log(id, dir)
      dispatch({ type: `MOVE_LAYER_${dir.toUpperCase()}`, payload: id });
    });

    return () => {
      socket.off("layer-remove");
      socket.off("layer-move");
    };

  }, [dispatch]);

  return (
    <div className="layer-info">
      <input
        type="radio"
        id={id}
        checked={active}
        onChange={onToggle}
      />
      <label htmlFor={id}>{name}</label>
      <button onClick={onDelete}>Delete</button>
      <button onClick={() => onMoveLayer('up')}>Up</button>
      <button onClick={() => onMoveLayer('down')}>Down</button>
    </div>
  );
}

export default LayerInfo;