// Lib
import UTILS from '../../utils';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { COLORS } from '../../state/store';

// Types
import type { FC } from 'react';

// Styles
import './Toolbar.styles.css';

const Toolbar: FC = () => {
  const color = useAppSelector(state => state.canvas.color);
  const dispatch = useAppDispatch();

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_COLOR', payload: color });
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
    <div id="toolbar-container">
      {renderedColors}
    </div>
  );
}

export default Toolbar;