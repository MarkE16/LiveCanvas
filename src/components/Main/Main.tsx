// Types
import type { FC } from "react";

// Styles
import "./Main.styles.css";

// Components
import LeftToolbar from "../LeftToolbar/LeftToolbar";
import Canvas from "../Canvas/Canvas";
import DrawingToolbar from "../DrawingToolbar/DrawingToolbar";
import LayerManager from "../LayerManager/LayerManager";
import Footer from "../Footer/Footer";

const Main: FC = () => {
  return (
    <main id="main-content">
      <LeftToolbar />
      
      <div id="main-canvas-pane">
        <DrawingToolbar />
        <div className="canvas-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}>
          <Canvas />
        </div>
      </div>
      <div id="right-side-pane">
        <LayerManager />
        <Footer />
      </div>
    </main>
  );
}

export default Main;