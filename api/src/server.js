import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path';
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.server.js";
// routes
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import matchRoutes from "./routes/matchRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import tagRoutes from "./routes/tagRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
// import profileRoutes from "./routes/profileRoutes.js"

import { connectDB } from "./config/db.js";

if (process.env.NODE_ENV === "development")
	console.warn = () => {};

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

initializeSocket(httpServer);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
console.log("CLIENT URL=", process.env.CLIENT_URL);
app.use(cors({
	origin: process.env.CLIENT_URL,
	methods: "GET,POST,PUT,DELETE,OPTIONS" ,
	credentials:true,
}));
app.set('trust proxy', 1);

let dbPool;
connectDB().then(pool => {
	dbPool = pool;
}).catch(err => {
	console.error("Failed to connect to DB: ", err);
	process.exit(1);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/search", searchRoutes);
// app.use("/api/profile", profileRoutes);

// if(process.env.NODE_ENV === 'production')
// {
//     app.use(express.static(path.join(__dirname, "/client/dist")));

//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
//     });
// }

httpServer.listen(PORT, "0.0.0.0", () => {
	console.log("Server started at this port: " + PORT);
});

