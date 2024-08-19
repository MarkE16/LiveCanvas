// Lib
import logo from "../../assets/logo.jpg";

// Types
import type { FC } from "react";

// Styles
import "./Navbar.styles.css";

const Navbar: FC = () => {
  const REPO_URL = "https://github.com/MarkE16/LiveCanvas";

  return (
    <nav id="navbar-container">
      <section id="navbar-links-section">
        <div id="navbar-logo-container">
          <img id="navbar-logo" src={logo} alt="logo" />
        </div>
        <div id="navbar-links">
          <a href="#">File</a>
          <a href="#">Edit</a>
          <a href="#">View</a>
        </div>
      </section>
      <section id="navbar-buttons-section">
        <a href={REPO_URL} target="_blank">
          <i className="fab fa-github"></i>
          <span>GitHub</span>
        </a>
      </section>
    </nav>
  );
};

export default Navbar;