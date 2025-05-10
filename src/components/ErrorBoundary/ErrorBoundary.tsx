import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
	children: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
	info: ErrorInfo | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, info: null };
	}

	static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("Error caught by ErrorBoundary:", error, info);
		this.setState({ error, info });
	}

	render(): ReactNode {
		if (this.state.hasError) {
			// Fallback UI when an error is caught
			const REPO_ISSUES_URL = "https://github.com/MarkE16/LiveCanvas/issues";
			return (
				<div>
					<h1>Uh oh. Something went wrong.</h1>
					<p>
						Something you did caused an error. It is recommended that you report
						this error by submitting an issue <a href={REPO_ISSUES_URL}>here</a>
						.
					</p>
					<details>
						<summary>Click for more info</summary>
						<pre>{this.state.error?.toString()}</pre>
						<pre>{this.state.info?.componentStack}</pre>
					</details>
				</div>
			);
		}

		return this.props.children; // Render child components normally
	}
}

export default ErrorBoundary;
