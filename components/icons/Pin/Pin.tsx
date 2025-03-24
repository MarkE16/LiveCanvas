// Styles
import "../icons.styles.css";
const Pin = () => (
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
		{/* Location pin outline */}
		<path d="M12.5 21.5c0 0-8-5.5-8-12s3.5-8 8-8 8 1.5 8 8-8 12-8 12z" />
		{/* Inner circle */}
		<circle
			cx="12.5"
			cy="9.5"
			r="3"
		/>
	</svg>
);
export default Pin;
