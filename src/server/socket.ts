import { io } from "socket.io-client";

const URL = import.meta.env.DEV ? 
  "http://localhost:8080" : 
  undefined

// According to the Socket.IO documentation,
// `undefined` means that the URL will
// be computed from the `window.location` object.
// https://socket.io/how-to/use-with-react#example:~:text=//%20%22undefined%22%20means%20the%20URL%20will%20be%20computed%20from%20the%20%60window.location%60%20object

// @ts-ignore
export const socket = io(URL, {
  autoConnect: false
});