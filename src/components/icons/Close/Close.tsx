// Styles
import "../icons.styles.css";
const Close = () => (
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
		{/* Circle */}
		<circle
			cx="12.5"
			cy="12.5"
			r="10"
		/>
		{/* X shape */}
		<path d="M8.5 8.5L16.5 16.5M16.5 8.5L8.5 16.5" />
	</svg>
);
export default Close;
