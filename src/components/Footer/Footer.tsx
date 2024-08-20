// Lib
import logo from "../../assets/logo.jpg";

// Types
import { FC } from "react";

// Styles
import "./Footer.styles.css";

const Footer: FC = () => {
  const VERSION = "a0.0.1";
  const REPO_URL = "https://github.com/MarkE16/LiveCanvas";

  return (
    <footer id="footer-container">
      <img id="footer-logo" src={logo} alt="logo" />
      <span id="site-name">Live Canvas</span>
      <span id="version">Version {VERSION}</span>
      <hr />
      <span id="footer-text">
        Made with ❤️ by <a href="https://github.com/MarkE16" className="footer-link">MarkE16</a> and {" "}
        <a href="https://github.com/MarkE16/LiveCanvas/graphs/contributors" className="footer-link">more</a>.
      </span>

      <div id="footer-links">
        <a href="" className="footer-link">Privacy Policy</a>
        <a href="" className="footer-link">Terms of Service</a>
        <a href={REPO_URL} className="footer-link" target="_blank">GitHub</a>
        <a href="" className="footer-link">Release Notes</a>
      </div>
    </footer>
  );
}

export default Footer;