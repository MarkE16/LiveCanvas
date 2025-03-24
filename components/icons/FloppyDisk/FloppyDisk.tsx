// Styles
import "../icons.styles.css";

const SaveIcon = ({ checkmark = false }: { checkmark: boolean }) => (
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
		<rect
			x="3"
			y="5"
			width="18"
			height="18"
			rx="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		<rect
			x="7"
			y="6"
			width="10"
			height="7"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{checkmark ? (
			<path
				d="M8 16l3 5 7-7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		) : (
			<circle
				cx="12"
				cy="18"
				r="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		)}
	</svg>
);

export default SaveIcon;
