import { renderPage } from "vite-plugin-ssr/server";

export default async function handler(req, res) {
	const { url } = req;

	if (!url) throw new Error("req.url is undefined");

	const pageContextInit = { urlOriginal: url };
	const pageContext = await renderPage(pageContextInit);
	const { httpResponse } = pageContext;

	if (!httpResponse) {
		res.statusCode = 200;
		res.end();
		return;
	}

	const { body, statusCode, headers } = httpResponse;
	console.log("Status code: ", statusCode);
	res.statusCode = statusCode;
	headers.forEach(([name, value]) => res.setHeader(name, value));
	res.end(body);
}
