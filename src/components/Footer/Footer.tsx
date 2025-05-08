// Lib
import { useState } from "react";

// Types
import type { ReactNode } from "react";

// Styles
import "./Footer.styles.css";

function Footer(): ReactNode {
	const [VERSION] = useState<string | null>("v0.0.1");

	const MAINTAINER_URL = "https://github.com/MarkE16";
	const REPO_URL = MAINTAINER_URL + "/LiveCanvas";
	// const CONTRIBUTORS_URL = REPO_URL + "/graphs/contributors";
	// const MAINTAINER_NAME = MAINTAINER_URL.split("/").pop() ?? "Unknown Maintainer";

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
			<em id="version">{VERSION}</em>
			<div id="footer-links">
				<a
					href=""
					className="footer-link"
				>
					Privacy Policy
				</a>
				<a
					href=""
					className="footer-link"
				>
					Terms of Service
				</a>
				<a
					href={REPO_URL}
					className="footer-link"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
				<a
					href=""
					className="footer-link"
				>
					Release Notes
				</a>
			</div>
		</footer>
	);
};

export default Footer;
