// Lib

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import LeftToolbar from "./components/LeftToolbar/LeftToolbar";
import LayerInfo from "./components/LayerInfo/LayerInfo";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Main from "./components/Main/Main";

function App() {
  
  // Socket for listening for layer changes.
  // useEffect(() => {
    
  //   const updateLayers = (pendingLayers) => {
  
  //     console.log(pendingLayers)
  //     const newLayers = pendingLayers.map((layer, i) => {
  //       return { ...layer, active: layersRef.current[i]?.active ?? false };
  //     });
  
  //     console.log(newLayers)
  
  //     dispatch({ type: "SET_LAYERS", payload: newLayers });
  //   }

  //   socket.on("layer-update", (layers) => {
  //     updateLayers(layers);
  //   });

  //   socket.once("user-connect", (layers) => {
  //     if (!layers) {
  //       socket.emit("layer-update", layersRef.current);
  //     } else {
  //       updateLayers(layers);
  //     }
  //   });

  //   // ONLY CALL THIS ONCE HERE.
  //   // When using the socket elsewhere,
  //   // only set up an effect that listens for
  //   // socket events.
  //   socket.connect();


  //   return () => {
  //     socket.off("layer-update");
  //     socket.disconnect();
  //   };

  // }, [dispatch]);


  return (
    <>
      <Navbar />

      <Main />
    </>
  );
}

export default App
