// Lib
import logo from "../../assets/logo.jpg";
import { Snackbar, CircularProgress } from "@mui/material"
import { useState } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";

// Types
import type { FC } from "react";

// Styles
import "./Navbar.styles.css";
import UTILS from "../../utils";

const Navbar: FC = () => {
  const [exporting, setExporting] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const layers = useAppSelector(state => state.canvas.layers);
  const width = useAppSelector(state => state.canvas.width);
  const height = useAppSelector(state => state.canvas.height);

  const openSnackbar = () => {
    setSnackbarOpen(true);
  }

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  }

  const handleExport = () => {
    const substituteCanvas = document.createElement("canvas");
  
    // Set the canvas size (assuming all layers have the same dimensions)
    console.log(layers);
    substituteCanvas.width = width; // Set to your canvas width
    substituteCanvas.height = height; // Set to your canvas height
    substituteCanvas.style.display = "none";
    substituteCanvas.style.backgroundColor = "white";
  
    const ctx = substituteCanvas.getContext("2d");
  
    const promises = layers.map(layer => {
      return new Promise<void>(resolve => {
        const base64 = layer.base64Buffer;
  
        if (base64) {
          const img = new Image();
          
          img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            resolve();  // Resolve the promise after drawing the image
          }

          const buffer = new Uint8Array(
            UTILS.base64ToArrayBuffer(base64)
          );
          img.src = URL.createObjectURL(new Blob([buffer]));
        } else {
          resolve();  // Resolve immediately if there's no image data
        }
      });
    });
  
    Promise.all(promises).then(() => {
      const image = substituteCanvas.toDataURL("image/jpeg", 1.0);
      const a = document.createElement("a");
  
      a.href = image;
      a.download = "canvas.jpg";
      a.click();
  
      // Clean up
      URL.revokeObjectURL(a.href);
      substituteCanvas.remove();
      a.remove();
    });
  };  

  return (
    <nav id="navbar-container">
      <section id="navbar-links-section">
        <div id="navbar-logo-container">
          <img id="navbar-logo" src={logo} alt="logo" />
        </div>
        <div id="navbar-links">
          <button onClick={openSnackbar}>File</button>
          <button onClick={openSnackbar}>Edit</button>
          <button onClick={openSnackbar}>View</button>
        </div>
      </section>
      <section id="navbar-buttons-section">
        <button onClick={handleExport}>
          <span>Export Canvas</span>
        </button>
        <CircularProgress />
      </section>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="This feature is not yet implemented."
      />
    </nav>
  );
};

export default Navbar;