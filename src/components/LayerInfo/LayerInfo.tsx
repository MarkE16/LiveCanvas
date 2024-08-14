// Lib
import { useAppDispatch } from "../../state/hooks/reduxHooks";

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
    dispatch({ type: "REMOVE_LAYER", payload: id });
  }

  const onMoveLayer = (dir: 'up' | 'down') => {
    dispatch({ type: `MOVE_LAYER_${dir.toUpperCase()}`, payload: id });
  }

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