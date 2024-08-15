import { v4 as uuidv4 } from 'uuid';

type Layer = {
  name: string;
  id: string;
  buffer: ArrayBuffer | undefined; // => to store the image data from the canvas
  active: boolean;
}

/**
 * Capitalizes the first letter of a string and leaves the rest
 * of the string untouched.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Create a new Layer object.
 * @param name The name of the layer. Defaults to "New Layer".
 * @returns A new Layer object.
 */
const createLayer = (name: string = "New Layer"): Layer => ({ name, id: uuidv4(), active: false });

/**
 * Swaps the position of two Layer objects in an array. This is done by
 * selecting a Layer object at the `from` index and moving it to the `to` index.
 * The Layer object at the `to` index is then moved to the `from` index.
 * 
 * If the `from` or `to` index is out of bounds, the original array is returned.
 * @param layers An array of Layer objects.
 * @param from The index of the layer to move.
 * @param to The new index of the moving layer.
 * @returns The modified array of Layer objects.
 */
const moveLayer = (layers: Layer[], from: number, to: number): Layer[] => {

  if (from < 0 || from >= layers.length) {
    return layers;
  }

  if (to < 0 || to >= layers.length) {
    return layers;
  }

  const layerAtTo = layers[to];
  const layerAtFrom = layers[from];

  return layers.map((layer, i) => {
    if (i === from) return layerAtTo;
    if (i === to) return layerAtFrom;
    return layer;
  });
}

const UTILS = {
  capitalize,
  createLayer,
  moveLayer
};

export default UTILS;