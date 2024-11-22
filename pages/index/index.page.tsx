// Lib
import { useEffect } from "react";
import { navigateTo } from "../../utils";

// Types
import type { FC } from "react";

export { Page };

const Page: FC = () => {
	// Redirect.
	useEffect(() => {
		navigateTo("editor");
	}, []);

	return (
		<>
			<h2>This is the main page</h2>
			<span>Redirecting to the editor...</span>
		</>
	);
};
