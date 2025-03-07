// Lib
import { useEffect } from "react";
import { navigateTo } from "../../lib/utils";

export { Page };

const Page = () => {
	useEffect(() => {
		navigateTo("/home");
	}, []);

	return null;
};
