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

	it("should initally return entries", async () => {
		const entries = await LayersStore.getLayers();

		for (const [id, entry] of entries) {
			expect(id).toBe(entry.id);
			expect(entry.name).toMatch(/Layer \d/);
			expect(entry.position).toBeGreaterThanOrEqual(0);
			expect(entry).toHaveProperty("image");
		}
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

		const expectedMap = [...layers, ...newLayers].reduce(
			(acc, layer) => {
				acc[layer.id] = {
					id: layer.id,
					name: layer.name,
					position: layer.position
				};
				return acc;
			},
			{} as Record<string, { id: string; name: string; position: number }>
		);

		const entries = await LayersStore.getLayers();

		// Check we have the expected number of entries
		expect(entries.length).toBe([...layers, ...newLayers].length);

		// Check each entry matches our expected data
		for (const [id, item] of entries) {
			// Check if we have an expected entry with this ID
			expect(expectedMap).toHaveProperty(id);

			const expectedItem = expectedMap[id];

			expect(item.id).toBe(expectedItem.id);
			expect(item.name).toBe(expectedItem.name);
			expect(item.position).toBe(expectedItem.position);
			expect(item).toHaveProperty("image");
		}
	});

	it("should get a single layer", async () => {
		const layer = await LayersStore.getLayer("layer-123");

		expect(layer).toHaveProperty("id", "layer-123");
		expect(layer).toHaveProperty("name", "Layer 1");
		expect(layer).toHaveProperty("position", 0);
		expect(layer).toHaveProperty("image");
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
