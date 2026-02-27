import io from "socket.io-client";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const IP = import.meta.env.VITE_IP
const SOCKET_URL = import.meta.env.MODE === "development" ? `http://${IP}:5000`: "/";

let socket = null;

export class SocketNotInitializedError extends Error {
    constructor(message) {
        super(message);
        this.name = "SocketNotInitializedError";
    }
}

export const initializeSocket = (userId) => {
    if(socket) {
        socket.disconnect()
    };

    socket = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { userId },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 10000,
    });
};

export const getSocket = () => {
    if(!socket) {
        throw new SocketNotInitializedError("Socket is not initialized.");
    };
    return socket;
}

export const disconnectSocket = async () => {
   if (socket) {
        try {
            socket.disconnect();
            socket = null;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };
};