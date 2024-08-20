// Lib
import { useState, useEffect } from "react";

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
import AlphaSoftwareAgreementModal from "../AlphaSoftwareAgreementModal/AlphaSoftwareAgreementModal";
import MobileNotSupportedModal from "../MobileNotSupportedModal/MobileNotSupportedModal";

const Main: FC = () => {
  const [showAlphaModal, setShowAlphaModal] = useState<boolean>(false);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);

  useEffect(() => {
    const localStorage = window.localStorage;

    const agreed = localStorage.getItem("agreed") === "true";



    if (!agreed) {
      setShowAlphaModal(true);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      setShowMobileModal(true);
    }
  }, []);

  return (
    <main id="main-content">
      <AlphaSoftwareAgreementModal open={showAlphaModal} onClose={() => {
        setShowAlphaModal(false);
        window.localStorage.setItem("agreed", "true");
      }} />

      <MobileNotSupportedModal open={showMobileModal} />
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