// Lib
import * as UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { SHAPES } from '../../state/store';
import { Tooltip } from '@mui/material';


// Type
import type { FC } from 'react';

// Styles
import './DrawingToolbar.styles.css';

const DrawingToolbar: FC = () => {
  const { drawStrength, eraserStrength, mode, shape } = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();

  const strengthSettings = mode === "draw" ? {
    value: drawStrength,
    min: 1,
    max: 15,
  } : {
    value: eraserStrength,
    min: 5,
    max: 10,
  }

  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = parseInt(e.target.value);

    dispatch({ type: `SET_${e.target.name}`, payload: strength });
  }

  const handleShapeChange = (shape: string) => {
    dispatch({ type: 'SET_SHAPE', payload: shape });
  }

  const renderedShapes = SHAPES.map((s) => {
    const { icon, name } = s;

    const isActive = shape === name;
    
    return (
      <Tooltip title={UTILS.capitalize(name)} arrow placement="bottom">
          <button
            key={name}
            className={`shape-option ${isActive ? 'active' : ''}`}
            onClick={() => handleShapeChange(name)}
          >
          <i className={`fa ${icon}`} />
        </button>
      </Tooltip>
    );
  });

  return (
    <div id="drawing-toolbar">
      { mode === "shapes" && <div id="shapes">{renderedShapes}</div> }
      {/* <div className="vertical-line"></div> */}
      { (mode === "draw" || mode === "erase") && (
        <div id="additional-settings">
          Strength: <input 
          name={`${mode}_strength`.toUpperCase()}
          type="range"
          min={strengthSettings.min}
          max={strengthSettings.max}
          step="1"
          value={strengthSettings.value}
          onChange={handleStrengthChange}
          />
          <label>{strengthSettings.value}</label>
        </div>
      )}
    </div>
  );
}

export default DrawingToolbar;