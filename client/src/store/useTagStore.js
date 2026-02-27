import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { sanitize } from "../utils/sanitize";

export const useTagStore = create((set) => ({
	userTags: [],
	popularTags: [],
	similarTags: [],
	loading_tag: false,

	fetchPopularTags: async () => {
		set({ loading_tag: true });
		try {
			const response = await axiosInstance.get("/tags/popular");
			set({ popularTags: response.data.popularTags });
		} catch (error) {
			set({popularTags: []});
		} finally {
			set({ loading_tag: false });
		}
	},

	fetchSimilarTags: async (tag_name) => {
		set({ loading_tag: true });
		try {
			const san = await sanitize('^[0-9a-zA-Z-_]+$', 255, tag_name);
			if (san.success === false)
				set ({ similarTags: []})
			else {
				const response = await axiosInstance.get(`/tags/similar/${tag_name}`);
				set ({ similarTags: response.data.similarTags})
			}
		} catch (error) {
			set ({ similarTags: []})
		} finally {
			set({ loading_tag: false });
		}
	},

	fetchUserTags: async (user_id) => {
		set({ loading_tag: true });
		try {
			const response = await axiosInstance.get(`/tags/user/${user_id}`);
			set ({ userTags: response.data.userTags});
		} catch (error) {
			set({userTags: []});
		} finally {
			set({ loading_tag: false });
		}
	},

	createTag: async (tag_name) => {
		set({ loading_tag: true });
		try {
			const san = await sanitize('^[0-9a-zA-Z-_]+$', 255, tag_name);
			if (san.success === false)
				{
					if (san.message == "forbidden char") {
						toast.error("Tags can only contain letters, numbers, '-' or '_'.");
						return false;
					}
					if (san.message == "length") {
						toast.error("Tag too long.");
						return false;
					}
				}
			else
				await axiosInstance.post("/tags/create", { tag_name: tag_name });
		} catch (error) {
            toast.error("Failed to create tag");
		} finally {
			set({ loading_tag: false });
		}
	},

	addTagToUser: async (tag_name) => {
		set({ loading_tag: true });
		try {
			await axiosInstance.post("/tags/assign", { tag_name: tag_name });
		} catch (error) {
            toast.error("Failed to assign tag");
		} finally {
			set({ loading_tag: false });
		}
	},

	removeTagFromUser: async (tag_name) => {
		set({ loading_tag: true });
		try {
			await axiosInstance.post("/tags/remove", { tag_name: tag_name });
		} catch (error) {
            toast.error("Failed to suppress tag");
		} finally {
			set({ loading_tag: false });
		}
	},

}));

export default useTagStore;