// Styles
import "../icons.styles.css";
const Rotate = () => (
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
    {/* Top curved arrow with arrow head */}
    <path d="M20 8.5C18.5 5.5 15.5 3.5 12 3.5C7 3.5 3 7.5 3 12.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8.5H20.5V5" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Bottom curved arrow with arrow head */}
    <path d="M5 16.5C6.5 19.5 9.5 21.5 13 21.5C18 21.5 22 17.5 22 12.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 16.5H4.5V20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export default Rotate;