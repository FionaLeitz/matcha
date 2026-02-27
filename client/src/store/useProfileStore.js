import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useProfileStore = create((set) => ({
	loading: false,
    userProfile: null,
    isOnline: false,

    getUserOnlineStatus: async (userId) => {
        try {
            const res = await axiosInstance.get(`/users/online/${userId}`);
            if (res.data.is_connected) {
                set({ isOnline: true});
            }
            else {
                set({ isOnline: false});
            }
        } catch (error) {
            set({ isOnline: false});
            const errorMessage = error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage);
        }
    },

    getUserProfile: async (username) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/users/${username}`);
            set({ userProfile: res.data.userProfile });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },

    addViews: async (viewed_username) => {
        try {
            const res = await axiosInstance.put(`/users/addviews`, {viewed_username});
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage);
        }
    },
}));