import {
	describe,
	it,
	beforeAll,
	beforeEach,
	afterEach,
	afterAll,
	expect
} from "vitest";
import { renderHookWithProviders } from "../test-utils";
import { renderHook } from "@testing-library/react";
import type { RenderHookResult } from "@testing-library/react";
import useIndexed from "../../state/hooks/useIndexed";

const mockLayersData = {
	"123": {
		name: "test canvas 1",
		image: new Blob(),
		position: 0
	},
	"456": {
		name: "test canvas 2",
		image: new Blob(),
		position: 1
	},
	"789": {
		name: "test canvas 3",
		image: new Blob(),
		position: 2
	}
};

const mockElementsData = {
	items: [
		{
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			shape: "rectangle",
			fill: "red",
			border: "black",
			layerId: "123",
			id: "1"
		},
		{
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			shape: "rectangle",
			fill: "red",
			border: "black",
			layerId: "456",
			id: "2"
		},
		{
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			shape: "rectangle",
			fill: "red",
			border: "black",
			layerId: "789",
			id: "3"
		}
	]
};

function populateStore(
	db: IDBDatabase,
	name: string,
	values: Record<string, unknown>
) {
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(name, "readwrite");
		const store = transaction.objectStore(name);

		Object.entries(values).forEach(([key, value]) => {
			store.put(value, key);
		});

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject();
	});
}

function clearStore(db: IDBDatabase, name: string) {
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(name, "readwrite");
		const store = transaction.objectStore(name);

		store.clear();

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject();
	});
}

describe("useIndexed functionality", () => {
	let result: RenderHookResult<ReturnType<typeof useIndexed>, unknown>;
	let db: IDBDatabase;

	beforeAll(async () => {
		db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("canvas");

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject();
			request.onupgradeneeded = () => {
				request.result.createObjectStore("layers");
				request.result.createObjectStore("elements");
			};
		});
	});

	beforeEach(async () => {
		// Populate the database
		await populateStore(db, "layers", mockLayersData);
		await populateStore(db, "elements", mockElementsData);
		result = renderHookWithProviders(useIndexed);
	});

	afterEach(async () => {
		result.unmount();

		// Clean up the database
		await clearStore(db, "layers");
		await clearStore(db, "elements");
	});

	afterAll(() => {
		db.close();
	});

	it("should return the initial values", () => {
		expect(result.result.current).toEqual({
			get: expect.any(Function),
			set: expect.any(Function),
			remove: expect.any(Function)
		});
	});

	it("should return all values at a store", () => {
		const arr: [
			string,
			(typeof mockLayersData)[keyof typeof mockLayersData]
		][] = [];

		Object.keys(mockLayersData).forEach((key) => {
			arr.push([
				key,
				{
					...mockLayersData[key as keyof typeof mockLayersData],
					image: expect.any(Object)
				}
			]);

			expect(result.result.current.get("layers")).resolves.toEqual(arr);
		});
	});

	it("should return the value at the specified key", () => {
		expect(result.result.current.get("layers", "123")).resolves.toEqual({
			...mockLayersData["123"],
			image: expect.any(Object)
		});

		expect(result.result.current.get("elements", "items")).resolves.toEqual(
			mockElementsData["items"]
		);
	});

	it("should return an undefined value for a non-existant key", () => {
		expect(
			result.result.current.get("layers", "non-existant-key")
		).resolves.toBeUndefined();
	});

	it("should set a value for a non-existing key", () => {
		const key = "new-key";

		expect(result.result.current.get("layers", key)).resolves.toBeUndefined();
		expect(
			result.result.current.set("layers", key, {
				name: "new canvas",
				image: new Blob(),
				position: 3
			})
		).resolves.toBeUndefined();

		// Verify that the value was set
		expect(result.result.current.get("layers", key)).resolves.toEqual({
			name: "new canvas",
			image: expect.any(Object),
			position: 3
		});
	});

	it("should override an existing key with a new value", () => {
		const key = "123";
		const newValue = {
			name: "different name",
			image: new Blob(),
			position: 3
		};

		expect(result.result.current.get("layers", key)).resolves.toEqual({
			...mockLayersData[key],
			image: expect.any(Object)
		});

		expect(
			result.result.current.set("layers", key, newValue)
		).resolves.toBeUndefined();

		// Verify that the value was set
		expect(result.result.current.get("layers", key)).resolves.toEqual({
			...newValue,
			image: expect.any(Object)
		});
	});

	it("should remove a key from the store", () => {
		const key = "123";

		expect(result.result.current.get("layers", key)).resolves.toEqual({
			...mockLayersData[key],
			image: expect.any(Object)
		});

		expect(
			result.result.current.remove("layers", key)
		).resolves.toBeUndefined();

		// Verify that the value was removed
		expect(result.result.current.get("layers", key)).resolves.toBeUndefined();
	});

	it("should do nothing if removing a non-existant key", () => {
		expect(
			result.result.current.remove("layers", "non-existant-key")
		).resolves.toBeUndefined();

		// Verify nothing was removed
		const arr: [
			string,
			(typeof mockLayersData)[keyof typeof mockLayersData]
		][] = [];

		Object.keys(mockLayersData).forEach((key) => {
			arr.push([
				key,
				{
					...mockLayersData[key as keyof typeof mockLayersData],
					image: expect.any(Object)
				}
			]);
		});
		expect(result.result.current.get("layers")).resolves.toEqual(arr);
	});

	describe("useIndexed error cases", () => {
		it("should throw for a non-existant store", () => {
			expect(
				result.result.current.get("non-existant-store", "123")
			).rejects.toThrow();
		});

		it("should throw if not rendered within provider", () => {
			expect(() => renderHook(useIndexed)).toThrow(
				"useIndexed must be used within the IndexedDBProvider"
			);
		});
	});
});
