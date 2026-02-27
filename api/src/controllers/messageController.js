import { getIO, getConnectedUsers } from "../socket/socket.server.js"
import { createNotification, findUserById, findChatByUsers, createMessage, findMessagesByChatId } from '../models/dbQueries.js'
import { sanitize } from "./authController.js";

export const sendMessage = async(req, res) => {
	try {
		const { content, recipientId } = req.body
		
		const userIdNumber = Number(recipientId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (Number(recipientId) === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't send messages to yourself."
			});
		}

		const regex = new RegExp('^[\\p{L}\\p{N}\\s\\p{Emoji_Presentation}\\-_!?,.$#^&*=+:;~@\'\\s]+$', 'u');
		await sanitize(regex, 255, content);

        const chat = await findChatByUsers(req.user.id, recipientId);
        const newMessage = await createMessage(chat.id, req.user.id, content);
		const recipientUser = await findUserById(recipientId);

        const io = getIO();
        const connectedUsers = getConnectedUsers();

		const recipientSocketId = connectedUsers.get(recipientId);

		if (!recipientUser.blocked.includes(req.user.id)) {
			if (recipientSocketId) {
				const notification = await createNotification('message', req.user.username, recipientUser.username, true);
				io.to(recipientSocketId).emit("newMessage", {
					message: newMessage,
					username: req.user.username,
				});
			}
			else
			{
				const notification = await createNotification('message', req.user.username, recipientUser.username, false);
				io.to(recipientSocketId).emit("newMessage", {
					message: newMessage,
					username: req.user.username,
				});

			}
		}

		res.status(201).json({
			success: true,
			message: newMessage
		});
	} catch (error) {
		let message;
		if (error.code && error.detail) // postgre error
			message = error.detail.replace(/Key|\(|\)|'|'/g, '').replace(/=/g, ' ');
		else
			message = error?.response?.data?.message;
		res.status(400).json({
			success: false,
			message
		});
	}
};

export const getConversation = async(req, res) => {
	try {
		const { userId } = req.params;		
		const userIdNumber = Number(userId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}
        const chat = await findChatByUsers(req.user.id, parseInt(userId));
		if (!chat) {
			res.status(404).json({
				success: false,
				message: "This conversation does not exist.",
			});
			return ;
		}
        const messages = await findMessagesByChatId(chat.id);
		res.status(200).json({
			success: true,
			messages
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};