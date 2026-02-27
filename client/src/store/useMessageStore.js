import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from '../socket/socket.client';
import { useAuthStore } from "../store/useAuthStore";
import { sanitize } from "../utils/sanitize";

export const useMessageStore = create((set) => ({
    messages: [],
    loading: true,

    addMessage: (newMessage) =>
        set(state => ({
            messages: [...state.messages, newMessage],
        })
    ),

    sendMessage: async (recipientId, content) => {
        try {
            const san = await sanitize('^[\\p{L}\\p{N}\\s\\p{Emoji_Presentation}\\-_!?,.$#^&*=+:;~@\'\\s]+$', 255, content);
			if (san.success === false)
			{
				if (san.message == "forbidden char") {
					toast.error("Forbidden char in message.");
					return ;
				}
				if (san.message == "length") {
					toast.error("Message too long.");
					return ;
				}
			}
            set(state => ({
                messages: [
                    ...state.messages, {sender_id: useAuthStore.getState().authUser.id, content, created_at: Date.now()},
                ],
            }));
            const res = await axiosInstance.post('/messages/send', {recipientId, content});
            // set(state => ({
            //     messages: [
            //         ...state.messages, {sender_id: useAuthStore.getState().authUser.id, content, created_at: Date.now()},
            //     ],
            // })); est-ce qu'il faudrait faire ca, c'est-a-dire une fois qu'on sait que le message a bien ete envoye avec succes,
            // update les infos de 'messages[]' avec les infos recuperees depuis 'res' (notamment pour created_at)?
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong.");
        }
    },

    getMessages: async (userId) => {
        try {
            set({loading: true});
            const res = await axiosInstance.get(`/messages/conversation/${userId}`);
            set({messages: res.data.messages});
        } catch (error) {
            set({messages: []});
        } finally {
            set({loading: false});
        }
    },
}));