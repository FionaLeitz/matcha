import { Server } from 'socket.io';
import { updateOnlineFromBack } from '../controllers/userController.js'

let io;

const connectedUsers = new Map(); // userId: socketId

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });

    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        if(!userId) return next(new Error("Invalid user ID"));

        socket.userId = userId;
        next();
    });

    io.on("connection", (socket) => {
        connectedUsers.set(socket.userId, socket.id);
        const userId = socket.handshake.auth.userId;
        socket.on("disconnect", () => {
            updateOnlineFromBack(userId);
            connectedUsers.delete(socket.userId);
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error ('Socket is not initialized');
    }
    return io;
};

export const getConnectedUsers = () => connectedUsers;