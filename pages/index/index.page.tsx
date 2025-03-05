// Lib
import { useEffect } from "react";
import { navigateTo } from "../../utils";

export { Page };

const Page = () => {
	useEffect(() => {
		navigateTo("/home");
	}, []);

	return null;
};
