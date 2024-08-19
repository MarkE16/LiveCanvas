// Lib
import logo from "../../assets/logo.jpg";

// Types
import { FC } from "react";

// Styles
import "./Footer.styles.css";

const Footer: FC = () => {
  const VERSION = "a0.0.1";

  return (
    <footer id="footer-container">
      <img id="footer-logo" src={logo} alt="logo" />
      <span id="site-name">Live Canvas</span>
      <span id="version">Version {VERSION}</span>
      <hr />
      <span id="footer-text">
        Made with ❤️ by <a href="https://github.com/MarkE16">MarkE16</a> and {" "}
        <a href="https://github.com/MarkE16/LiveCanvas/graphs/contributors">more</a>
      </span>

      <div id="footer-links">
        <a href="">Privacy Policy</a>
        <a href="">Terms of Service</a>
        <a href="">GitHub</a>
        <a href="">Release Notes</a>
      </div>
    </footer>
  );
}

export default Footer;