// Lib
import { useCallback, memo } from 'react';
import * as UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { MODES } from '../../state/store';
import { Tooltip } from '@mui/material';

// Types
import type { FC, MouseEvent, MouseEventHandler } from 'react';

// Styles
import './LeftToolbar.styles.css';
import useHistory from '../../state/hooks/useHistory';


type ToolbarButtonProps = {
  icon: string;
  name: string;
  shortcut: string;
}

const ToolbarButton: FC<ToolbarButtonProps> = memo(({ icon, name, shortcut }) => {
  const mode = useAppSelector(state => state.canvas.mode);
  const dispatch = useAppDispatch();
  const { undo, undoAction, redo, redoAction } = useHistory();

  console.log(undo, redo);
  const isActive = mode === name;

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback((e: MouseEvent) => {
    // e.preventDefault();
    e.stopPropagation();

    if (name === "undo") {
      undoAction();
    } else if (name === "redo") {
      redoAction();
    } else {
      dispatch({ type: 'SET_MODE', payload: name });
    }
  }, [dispatch, name, undoAction, redoAction]);

  const tooltip = UTILS.capitalize(name).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

  return (
    <Tooltip title={tooltip} arrow placement='right'>
        <button
          className={`toolbar-option ${isActive ? 'active' : ''}`}
          onClick={onClick}
          disabled={name === "undo" ? !undo.length : name === "redo" ? !redo.length : false}
        >
        <i className={`fa ${icon}`} />
      </button>
    </Tooltip>
  );
}, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name;
});


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