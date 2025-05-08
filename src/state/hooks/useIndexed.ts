// Lib
import { useContext } from "react";
import { IndexedDBContext } from "../../components/IndexedDBProvider/IndexedDBProvider";

/**
 * A custom hook to interact with the IndexedDB API. This hook
 * reads from the IndexedDBContext to get the database object.
 *
 * @returns An object containing functions to perform
 * get and set operations on the database.
 */
function useIndexed() {
	const context = useContext(IndexedDBContext);

	if (!context) {
		throw new Error("useIndexed must be used within the IndexedDBProvider.");
	}

	return context;
}

export default useIndexed;
