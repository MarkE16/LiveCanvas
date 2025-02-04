import "@testing-library/jest-dom"; // to import additional matchers
import { vi } from "vitest";

// Temporary solution for mocking GrowthBookProvider
// with features always on. This should hopefully be
// removed once we have a better solution.
vi.mock("@growthbook/growthbook-react", async (importOriginal) => {
	const original = (await importOriginal()) as NonNullable<
		typeof importOriginal
	>;

	return {
		...original,
		useFeatureIsOn: () => true
	};
});
