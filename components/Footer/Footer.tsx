// Lib
import logo from "../../assets/logo.jpg";
import { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";

// Types
import { FC } from "react";

// Styles
import "./Footer.styles.css";

const Footer: FC = () => {
  const [VERSION, setVERSION] = useState<string | null>("v1.0.0");

  const MAINTAINER_URL = "https://github.com/MarkE16";
  const REPO_URL = MAINTAINER_URL + "/LiveCanvas";
  const CONTRIBUTORS_URL = REPO_URL + "/graphs/contributors";
  const MAINTAINER_NAME = MAINTAINER_URL.split("/").pop() ?? "Unknown Maintainer";

  // Basic implementation of fetching the version.
  // In the future, this will be fetched from GitHub or some other service.
  // useEffect(() => {
  //   function getVersion() {
  //     return new Promise<string>(resolve => {
  //       setTimeout(resolve, 1000, "v1.0.0");
  //     });
  //   }

  //   getVersion().then((version: string) => setVERSION(version));
  // }, []);

  return (
    <footer id="footer-container">
      <img id="footer-logo" src={logo} alt="logo" />
      <span id="site-name">IdeaDrawn | Live Canvas</span>
      <span id="version">
        {VERSION ?? <Skeleton sx={{ bgcolor: 'grey.800' }} variant="text" width={50} />}
      </span>
      <hr />
      <span id="footer-text">
        Made with ❤️ by <a href={MAINTAINER_URL} className="footer-link">{MAINTAINER_NAME}</a> and {" "}
        <a href={CONTRIBUTORS_URL} className="footer-link">more</a>.
      </span>

      <div id="footer-links">
        <a href="" className="footer-link">Privacy Policy</a>
        <a href="" className="footer-link">Terms of Service</a>
        <a href={REPO_URL} className="footer-link" target="_blank" rel="noreferrer">GitHub</a>
        <a href="" className="footer-link">Release Notes</a>
      </div>
    </footer>
  );
}

export default Footer;