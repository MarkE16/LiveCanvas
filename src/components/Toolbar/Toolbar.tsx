// Lib
import { useEffect, useCallback } from 'react';
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
  shortcut: string;
}

const ToolbarButton: FC<ToolbarButtonProps> = ({ icon, name, shortcut }) => {
  const mode = useAppSelector(state => state.canvas.mode);
  const dispatch = useAppDispatch();

  const isActive = mode === name;

  const onClick = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: name });
  }, [dispatch, name]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === shortcut) {
        onClick();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, shortcut]);

  return (
    <div
      className={`toolbar-option ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={UTILS.capitalize(name) + ` (${shortcut.toUpperCase()})`}
    >
      <i className={`fa ${icon}`} />
    </div>
  );
}


const Toolbar: FC = () => {
  const mode = useAppSelector(state => state.canvas.mode);

  const renderedModes = MODES.map((m) => {
    return <ToolbarButton {...m} />;
  });

  return (
    <div id='toolbar-container'>
      <DrawingToolbar />
      { mode !== "select" && <hr /> }
      <div id="modes">
        {renderedModes}
      </div>
    </div>
  );
}

export default Toolbar;