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

  const onClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'SET_MODE', payload: name });
  }, [dispatch, name]);

useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === shortcut) {
        onClick(e);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, shortcut]);

  return (
    <button
      className={`toolbar-option ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={UTILS.capitalize(name) + ` (${shortcut.toUpperCase()})`}
    >
      <i className={`fa ${icon}`} />
    </button>
  );
}


const Toolbar: FC = () => {
  const { mode } = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();

  const renderedModes = MODES.map((m) => {
    return <ToolbarButton {...m} key={m.name} />;
  });

  useEffect(() => {

    function updateZoom(e: Event) {
      if (e instanceof WheelEvent) {
        if (!e.shiftKey) return;

        // Zooming in
        if (e.deltaY < 0) {
          dispatch({ type: 'INCREASE_SCALE' });
        } else {
          dispatch({ type: 'DECREASE_SCALE' });
        }
      }
      
      if (mode !== "zoom_in" && mode !== "zoom_out") return;
      
      // Zooming in
      if (mode === "zoom_in") {
        dispatch({ type: 'INCREASE_SCALE' });
      } else {
        dispatch({ type: 'DECREASE_SCALE' });
      }
    }

    window.addEventListener('wheel', updateZoom);
    window.addEventListener('click', updateZoom);

    return () => {
      window.removeEventListener('wheel', updateZoom);
      window.removeEventListener('click', updateZoom);
    };
  }, [mode, dispatch]);

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