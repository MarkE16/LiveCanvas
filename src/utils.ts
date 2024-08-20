import { v4 as uuidv4 } from 'uuid';
import { MouseEvent } from 'react';

type Layer = {
  name: string;
  id: string;
  base64Buffer: string | undefined; // => to store the image data from the canvas
  active: boolean;
  hidden: boolean;
}

type Coordinates = {
  x: number;
  y: number;
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
const createLayer = (name: string = "New Layer"): Layer => ({ name, id: uuidv4(), buffer: undefined, active: false, hidden: false });

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

/**
 * Get the position of the pointer on the given canvas element.
 * @param e The MouseEvent object.
 * @param canvas The canvas element.
 * @returns The position of the pointer on the canvas.
 */
const getCanvasPointerPosition = (e: MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Coordinates => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  return { x, y };
}

/**
 * Converts an ArrayBuffer object to a base64 string.
 * @param buffer An ArrayBuffer object.
 * @returns The base64 representation of the ArrayBuffer object.
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a base64 string to an ArrayBuffer object.
 * @param base64 The base64 string.
 * @returns The ArrayBuffer object.
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const UTILS = {
  capitalize,
  createLayer,
  moveLayer,
  getCanvasPointerPosition,
  arrayBufferToBase64,
  base64ToArrayBuffer,
};

export default UTILS;