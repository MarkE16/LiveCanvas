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
    setExporting(true);
    const substituteCanvas = document.createElement("canvas");
  
    // Set the canvas size (assuming all layers have the same dimensions)
    substituteCanvas.width = width; // Set to your canvas width
    substituteCanvas.height = height; // Set to your canvas height
  
    const ctx = substituteCanvas.getContext("2d");

    // Before drawing the images,
    // let's give the canvas a white background, as by default it's transparent.
    ctx!.fillStyle = "white";
    ctx!.fillRect(0, 0, width, height);
  
    const promises = layers.reverse().map(layer => {
      return new Promise<void>(resolve => {
        const base64String = layer.base64Buffer;

        if (!base64String) {
          resolve();
          return;
        }

        const img = new Image();
        img.src = base64String;

        img.onload = () => {
          ctx!.drawImage(img, 0, 0, width, height);
          resolve();
        };
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

      setExporting(false);
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
          <button onClick={openSnackbar}>Filter</button>
          <button onClick={openSnackbar}>Admin</button>
        </div>
      </section>
      <section id="navbar-buttons-section">
        <button onClick={handleExport} disabled={exporting} aria-disabled={exporting}>
          <span>Export Canvas</span>
        </button>
        {exporting && <CircularProgress size={20} />}
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