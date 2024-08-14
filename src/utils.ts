import { v4 as uuidv4 } from 'uuid';

const UTILS = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  createLayer: (name: string = "New Layer") => ({ name, id: uuidv4(), active: true }),
};

export default UTILS;