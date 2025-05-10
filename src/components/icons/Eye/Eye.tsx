// Styles
import "../icons.styles.css";

const Eye = ({ lineCross = false }: { lineCross: boolean }) => (
	<svg
		width="1em"
		height="1em"
		viewBox="0 0 25 25"
		fill="none"
		className="icon"
		xmlns="http://www.w3.org/2000/svg"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path
			d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		<circle
			cx="12"
			cy="12"
			r="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{lineCross && (
			<line
				x1="4"
				y1="4"
				x2="20"
				y2="20"
				strokeLinecap="round"
			/>
		)}
	</svg>
);

export default Eye;
