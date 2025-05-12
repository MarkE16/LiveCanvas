import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach
} from "vitest";
import LayersStore from "@/state/stores/LayersStore";

describe("LayersStore functionality", () => {
	const mockBlob = new Blob(["mockImageData"], { type: "image/png" });
	const layers = [
		{
			id: "layer-123",
			name: "Layer 1",
			image: mockBlob,
			position: 0
		},
		{
			id: "layer-456",
			name: "Layer 2",
			image: mockBlob,
			position: 1
		}
	];

	beforeAll(async () => {
		LayersStore.openStore();
	});

	beforeEach(async () => {
		await LayersStore.addLayers(layers);
	});

	afterEach(async () => {
		await LayersStore.clearStore();
	});

	afterAll(() => {
		LayersStore.closeStore();
	});

	it("should initally return entries", () => {
		const asEntries = layers.map((layer) => [
			layer.id,
			{
				...layer,
				image: expect.any(Blob)
			}
		]);

		expect(LayersStore.getLayers()).resolves.toEqual(asEntries);
	});

	it("should add layers", async () => {
		const newLayers = [
			{
				id: "layer-789",
				name: "Layer 3",
				image: mockBlob,
				position: 2
			},
			{
				id: "layer-101",
				name: "Layer 4",
				image: mockBlob,
				position: 3
			}
		];

		await LayersStore.addLayers(newLayers);

		const expected = [...layers, ...newLayers].map((layer) => [
			layer.id,
			{
				...layer,
				image: expect.any(Blob)
			}
		]);

		const entries = await LayersStore.getLayers();

		for (const entry of entries) {
			expect(
				expected.some(
					([id, val]) =>
						id === entry[0] && JSON.stringify(entry[1]) === JSON.stringify(val)
				)
			).toBe(true);
		}
	});

	it("should get a single layer", async () => {
		expect(LayersStore.getLayer("layer-123")).resolves.toEqual({
		...layers[0],
		image: expect.any(Blob)
		});
	});

	it("should not find an unknown layer", () => {
		expect(LayersStore.getLayer("non-existent-id")).resolves.toBeUndefined();
	});

	it("should delete layers", async () => {
		await LayersStore.removeLayer(["layer-123", "layer-456"]);

		expect(LayersStore.getLayers()).resolves.toEqual([]);
	});

	it("should clear the store", async () => {
		await LayersStore.clearStore();

		expect(LayersStore.getLayers()).resolves.toEqual([]);
	});
});
