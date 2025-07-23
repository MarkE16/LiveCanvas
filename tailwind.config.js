/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/renderer/*.tsx"],
	theme: {
		extend: {
			animation: {
				"tooltip-slide-down":
					"slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-up":
					"slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-right":
					"slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-left":
					"slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"menubar-appear": "menubarAppear 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"popover-slide": "popoverSlide 200ms",
				"popover-slide-reverse": "popoverSlide 200ms reverse ease-in",
			},
			gridTemplateAreas: {
				"color-slider": ["label output", "track track"]
			},
			keyframes: {
				slideUpAndFade: {
					from: { opacity: 0, transform: "translateY(2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				slideRightAndFade: {
					from: { opacity: 0, transform: "translateX(-2px)" },
					to: { opacity: 1, transform: "translateX(0)" }
				},
				slideDownAndFade: {
					from: { opacity: 0, transform: "translateY(-2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				slideLeftAndFade: {
					from: { opacity: 0, transform: "translateX(2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				menubarAppear: {
					from: { opacity: 0, transform: "scale(0.95)" },
					to: { opacity: 1, transform: "scale(1)" }
				},
				popoverSlide: {
					from: { transform: "var(--origin)", opacity: 0 },
					to: { transform: "translateY(0)", opacity: 1 }
				}
			}
		}
	},
	plugins: []
};
