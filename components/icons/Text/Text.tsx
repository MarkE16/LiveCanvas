// Styles
import "../icons.styles.css";

const Text = () => {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
			strokeWidth="2"
		>
			{/* Horizontal line of the T */}
			<line
				x1="6"
				y1="6"
				x2="18"
				y2="6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Vertical line of the T */}
			<line
				x1="12"
				y1="7"
				x2="12"
				y2="21"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default Text;
