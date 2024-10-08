// Lib
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';

// Types
import type { FC } from 'react';

// Styles
import './LayerPane.styles.css';

// Components
import LayerInfo from '../LayerInfo/LayerInfo';
import ColorWheel from '../ColorWheel/ColorWheel';

const LayerPane: FC = () => {
  const layers = useAppSelector(state => state.canvas.layers);
  const color = useAppSelector(state => state.canvas.color);
  const dispatch = useAppDispatch();

  const onBrushChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const currentColorAsArray = color.slice(5, -1).split(",");

    const newColor = `hsla(${currentColorAsArray[0]}, ${currentColorAsArray[1]}, ${currentColorAsArray[2]}, ${value})`;

    dispatch({ type: 'SET_COLOR', payload: newColor });
  }

  return (
    <aside id="layer-manager-container">
      <ColorWheel />
      <div>
        <i className='fa fa-paint-brush'></i>
        <input type="range" id="brush-size" defaultValue={1} min={0.01} max={1} step={0.01} onChange={onBrushChange} />
      </div>
      <button id="new-layer-button" onClick={() => dispatch({ type: 'ADD_LAYER' })}>
        <i className="fa fa-plus"></i>
      </button>
      <div id="layer-list">
        {
          layers.map((layer, i) => (
            <LayerInfo {...layer} key={layer.id} positionIndex={i} />
          ))
        }
      </div>
    </aside>
  );
}

export default LayerPane;