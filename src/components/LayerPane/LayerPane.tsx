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
  const showall = useAppSelector(state => state.canvas.show_all);
  const dispatch = useAppDispatch();

return (
    <aside id="layer-manager-container">
      <h4 id="layers-title">Layers</h4>
      <button onClick={() => dispatch({ type: "SHOW_ALL_LAYERS", payload: !showall  })}>Show all</button>
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