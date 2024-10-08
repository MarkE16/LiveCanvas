// Lib
import { useState, useEffect } from "react";

// Types
import type { FC } from "react";

// Styles
import "./Main.styles.css";

// Components
import CanvasPane from "../CanvasPane/CanvasPane";
import LeftToolbar from "../LeftToolbar/LeftToolbar";
import LayerPane from "../LayerPane/LayerPane";
import AlphaSoftwareAgreementModal from "../AlphaSoftwareAgreementModal/AlphaSoftwareAgreementModal";
import MobileNotSupportedModal from "../MobileNotSupportedModal/MobileNotSupportedModal";

const Main: FC = () => {
  const [showAlphaModal, setShowAlphaModal] = useState<boolean>(false);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);

  // useEffect(() => {
  //   const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
  //   if (isMobile) {
  //     setShowMobileModal(true);
  //     return;
  //   }
    
  //   const localStorage = window.localStorage;
  //   const agreed = localStorage.getItem("agreed") === "true";

  //   if (!agreed) {
  //     setShowAlphaModal(true);
  //   }

  // }, []);

  return (
    <main id="main-content">
      <AlphaSoftwareAgreementModal open={showAlphaModal} onClose={() => {
        setShowAlphaModal(false);
        window.localStorage.setItem("agreed", "true");
      }} />

      <MobileNotSupportedModal open={showMobileModal} />
      <LeftToolbar />
      
      <CanvasPane />

      {/* Right side pane */}
      <LayerPane />
    </main>
  );
}

export default Main;