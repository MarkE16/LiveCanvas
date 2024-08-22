// Lib
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';

// Types
import type { FC } from 'react';

// Styles
import './LayerPane.styles.css';

// Components
import LayerInfo from '../LayerInfo/LayerInfo';

const LayerPane: FC = () => {
  const layers = useAppSelector(state => state.canvas.layers);
  const dispatch = useAppDispatch();

  return (
    <aside id="layer-manager-container">
      <h4 id="layers-title">Layers</h4>
      <button id="new-layer-button" onClick={() => dispatch({ type: 'ADD_LAYER' })}>
        <i className="fa fa-plus"></i>
        {/* <span>New Layer</span> */}
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