import { create } from 'zustand'
import toast from 'react-hot-toast'
import { initializeSocket, getSocket, SocketNotInitializedError } from "../socket/socket.client";
import { useMatchStore } from "./useMatchStore";
import { useMessageStore } from "./useMessageStore";
import { useUserStore } from "./useUserStore";
import { axiosInstance } from "../lib/axios";

export const useNotificationStore = create((set, get) => ({
	notifications: [],
	not_seen: 0,

	getNotifications: async () => {
		try {
			const res = await axiosInstance.get(`/users/notification`);
			set({ notifications: res.data.notifications });
			set({ not_seen: res.data.not_seen })
		} catch (error) {
			toast.error("Error geting notifications");
		}
	},

	markNotificationIdAsSeen: async (notification_id) => {
		try {
			const res = await axiosInstance.put(`/users/notification/seen`, {notification_id});
		} catch (error) {
			toast.error("Error seeing notifications:");
		}
	},

	createSocket: async (id) => {
		try {
			getSocket();
		} catch (error) {
			if (error instanceof SocketNotInitializedError) {
				try {
					initializeSocket(id);
					get().subscribeToNotifications();
				} catch (error) {
					toast.error("Failed to create socket");
				}
			} else {
				toast.error("Error initializing socket");
			}
		}
	},

	subscribeToNotifications: () => {
		try {
			const socket = getSocket();
			const addMatch = useMatchStore.getState().addMatch;
			const removeMatch = useMatchStore.getState().removeMatch;
			const addMessage = useMessageStore.getState().addMessage;
			const getNotifications = get().getNotifications;
			const getProfileViews = useUserStore.getState().getProfileViews;
			const getProfileLikes = useUserStore.getState().getProfileLikes;
			socket.on("newMatch", (newMatch) => {
				addMatch(newMatch);
				toast.success(`You have a new match with ${newMatch.username}!`);
				getNotifications();
			});
			socket.on("unMatch", (oldMatch) => {
				removeMatch(oldMatch.id);
				toast.error(`${oldMatch.username} unmatched you :(`);
				getNotifications();
			});
			socket.on("newMessage", (message) => {
				addMessage(message.message);
				toast.success(`You have a new message from ${message.username}!`);
				getNotifications();
			})
			socket.on("newLike", (like) => {
				toast.success(`You have a new like from ${like.username}!`);
				getNotifications();
				getProfileLikes();
			})
			socket.on("unLike", () => {
				getProfileLikes();
			})
			socket.on("newView", (view) => {
				toast.success(`${view.username} looked at your profile!`);
				getNotifications();
				getProfileViews();
			})
		} catch (error) {
			toast.error("Error initializing socket listeners:");
		}
	},

	unsubscribeFromNotifications: () => {
		try {
			const socket = getSocket();
			socket.off("newMatch");
			socket.off("unMatch");
			socket.off("newMessage");
			socket.off("newLike");
			socket.off("unLike");
			socket.off("newView");
			
		} catch (error) {
			if (error instanceof SocketNotInitializedError) {
				toast.error("No socket, can't unsubscribe");
			} else {
				toast.error("Error with unsubscribing from events");
			}
		}
	},
}));