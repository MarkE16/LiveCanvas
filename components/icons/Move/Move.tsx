// Styles
import "../icons.styles.css";

const Move = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 25 25"
		width="1em"
		height="1em"
		fill="none"
		className="icon"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M12 21l-2 -2h4l-2 2z" />
		<line
			x1="12"
			y1="2"
			x2="12"
			y2="20"
		/>
		<path d="M21 12l-2 -2v4l2 -2z" />
		<line
			x1="2"
			y1="12"
			x2="20"
			y2="12"
		/>
		<path d="M3 12l2 -2v4l-2 -2z" />
		<line
			x1="22"
			y1="12"
			x2="4"
			y2="12"
		/>
		<path d="M12 3l-2 2h4l-2-2z" />
		<line
			x1="12"
			y1="22"
			x2="12"
			y2="4"
		/>
	</svg>
);

export default Move;
