// Lib
import UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { COLORS } from '../../state/store';


// Type
import type { FC } from 'react';

// Styles
import './DrawingToolbar.styles.css';

const DrawingToolbar: FC = () => {
  const { color, drawStrength, eraserStrength, mode } = useAppSelector(state => state.canvas);
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

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_COLOR', payload: color });
  }

  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = parseInt(e.target.value);

    dispatch({ type: `SET_${e.target.name}`, payload: strength });
  }

  const renderedColors = COLORS.map((c) => {
    const { name, value } = c;
    const isActive = color === value;

    return (
      <div
        key={name}
        className={`color-option ${name} ${isActive ? 'active' : ''}`}
        onClick={() => handleColorChange(name)}
        title={UTILS.capitalize(name)}
      ></div>
    );
  });

  return (
    <div id="drawing-toolbar">
      {
        mode === "draw" && (
          <>
            <div id="colors">
              {renderedColors}
            </div>
            <hr />
          </>
        )
      }
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
    </div>
  );
}

export default DrawingToolbar;