// Lib
import { useCallback } from 'react';
import UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { MODES } from '../../state/store';
import { Tooltip } from '@mui/material';

// Types
import type { FC, MouseEvent, MouseEventHandler } from 'react';

// Styles
import './LeftToolbar.styles.css';


type ToolbarButtonProps = {
  icon: string;
  name: string;
  shortcut: string;
}

const ToolbarButton: FC<ToolbarButtonProps> = ({ icon, name, shortcut }) => {
  const mode = useAppSelector(state => state.canvas.mode);
  const dispatch = useAppDispatch();

  const isActive = mode === name;

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback((e: MouseEvent) => {
    // e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'SET_MODE', payload: name });
  }, [dispatch, name]);

  const tooltip = UTILS.capitalize(name).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

  return (
    <Tooltip title={tooltip} arrow placement='right'>
        <button
          className={`toolbar-option ${isActive ? 'active' : ''}`}
          onClick={onClick}
        >
        <i className={`fa ${icon}`} />
      </button>
    </Tooltip>
  );
}


const LeftToolbar: FC = () => {
  const renderedModes = MODES.map((m) => {
    return <ToolbarButton {...m} key={m.name} />;
  });

  return (
    <aside id='left-toolbar-container'>
      {renderedModes}
    </aside>
  );
}

export default LeftToolbar;