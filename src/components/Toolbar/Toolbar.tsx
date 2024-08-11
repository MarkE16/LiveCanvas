// Lib
import UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { MODES } from '../../state/store';

// Types
import type { FC } from 'react';

// Styles
import './Toolbar.styles.css';

// Components
import DrawingToolbar from '../DrawingToolbar/DrawingToolbar';

type ToolbarButtonProps = {
  icon: string;
  name: string;
}

const ToolbarButton: FC<ToolbarButtonProps> = ({ icon, name }) => {
  const mode = useAppSelector(state => state.canvas.mode);
  const dispatch = useAppDispatch();

  const isActive = mode === name;

  const onClick = () => {
    dispatch({ type: 'SET_MODE', payload: name });
  }

  return (
    <div
      className={`toolbar-option ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={UTILS.capitalize(name)}
    >
      <i className={`fa ${icon}`} />
    </div>
  );
}


const Toolbar: FC = () => {
  const mode = useAppSelector(state => state.canvas.mode);

  const renderedModes = MODES.map((m) => {
    const { name, icon } = m;

    return <ToolbarButton key={name} icon={icon} name={name} />;
  });

  return (
    <div id='toolbar-container'>
      { mode === 'draw' && <DrawingToolbar />}
      <div id="modes">
        {renderedModes}
      </div>
    </div>
  );
}

export default Toolbar;