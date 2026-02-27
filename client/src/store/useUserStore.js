import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { translateThumbs } from "react-range/lib/utils";
import { sanitize } from "../utils/sanitize";
import axios from "axios";

export const useUserStore = create((set) => ({
	loading: false,
	views: [],
	likes: [],
	changeEmailResponse: '',
	changeEmailStatus: -1,
	has_allowed_loc: false,
	locResults: [],

	restoreDisliked: async () => {
		try {
			await axiosInstance.put("/users/restore");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	reportUserAsFake: async (user) => {
		try {
			const reported_id = user.id;
			const reported_username = user.username;
			await axiosInstance.put("/users/report/", { reported_id, reported_username });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	getProfileLikes: async () => {
		try {
			const res = await axiosInstance.get("/users/likes");
			set({ likes: res.data.likes });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	getProfileViewed: async () => {
		try {
			const res = await axiosInstance.get("/users/history/viewed");
			set({ views: res.data.views});
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},


	updateProfile: async (data) => {
		try {
			set({ loading: true });

			// -------------- sanitize --------------
			const san = await sanitize('^[0-9a-zA-Z-_\']+$', 42, [data.first_name, data.last_name, data.username]);
			if (san.success === false)
			{
				if (san.message == "forbidden char") {
					toast.error("First name, last name, and username can only contain letters, numbers, '-' or '_'.");
					return ;
				}
				if (san.message == "length") {
					toast.error("First name, last name or username too long.");
					return ;
				}
			}

			if (data.bio) {
				const san2 = await sanitize('^[\\p{L}\\p{N}\\s\\p{Emoji_Presentation}\\-_!?,.$#^&*=+:;~@\'\\s]*$', 255, data.bio);
				if (san2.success === false)
				{
					if (san2.message == "forbidden char") {
						toast.error("Forbidden char in bio.");
						return ;
					}
					if (san2.message == "length") {
						toast.error("Bio too long.");
						return ;
					}
				}
			}
			// --------------------------------------

			const res = await axiosInstance.put("/users/update", data);
			useAuthStore.getState().setAuthUser(res.data.user);
			toast.success("Profile updated successfully");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		} finally {
			set({ loading: false });
		}
	},

	deletePicture: async (image) => {
		try {
			const res = await axiosInstance.put("/users/update/picture/delete", {image});
			useAuthStore.getState().setAuthUser(res.data.user);
			toast.success("Picture deleted successfully");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	setProfilePicture: async (image) => {
		try {
			const res = await axiosInstance.put("/users/update/picture/select", {image});
			useAuthStore.getState().setAuthUser(res.data.user);
			toast.success("Profile picture changed successfully");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	updateLocation: async (latitude, longitude) => {
		let authorization = true;
		try {
			if (latitude == null && longitude == null) { // user has refused geolocalisation

				const response = await axios.get("https://ipapi.co/json/");
				const data = response.data
				const ip = data.ip;

				const res = await axiosInstance.get("/users/location", {  // get loc from ip
					params: { ip: ip }
				});
				
				latitude = res.data.latitude;
				longitude = res.data.longitude;
				authorization = false;
			}
			const res = await axiosInstance.put("/users/location", { latitude, longitude, authorization });
			useAuthStore.getState().setAuthUser(res.data.updatedUser);
		} catch (error) {
			const errorMessage = error.response?.data?.message;
			if (errorMessage)
    			toast.error(errorMessage);
		}
	},

	getProfileViews: async () => {
		try {
			const res = await axiosInstance.get("/users/history/views");
			set({ views: res.data.views});
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	updateEmail: async (newEmail) => {
		try {
			const san = await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, newEmail);
			if (san.success === false)
			{
				if (san.message == "forbidden char") {
					toast.error("Forbidden char in email.");
					return ;
				}
				if (san.message == "length") {
					toast.error("Email too long.");
					return ;
				}
			}
			const res = await axiosInstance.put("/users/update/email", {newEmail});
			useAuthStore.getState().setAuthUser(res.data.user);
			toast.success(res.data.message);
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
		}
	},

	callChangeEmail: async(token) => {
		try {
			const res = await axiosInstance.get(`/users/reset-email/${token}`);
			useAuthStore.getState().setAuthUser(res.data.user);
			set({ changeEmailResponse: res.data.message });
			set({ changeEmailStatus: res.status });
		} catch (error) {
			set({ changeEmailResponse: error.response.data.message || "An error occured."});
			set({ changeEmailStatus: error.status });
		}
	},

	searchLocation: async(query) => {
		try {
			const san = await sanitize('^[0-9a-zA-Z-_\']+$', 42, query);
			if (san.success === false)
				set({ locResults: [] });
			else {
				const res = await axiosInstance.get(`/users/search-loc/${query}`);
				set({ locResults: res.data.results });
			}
		  } catch (error) {
			set({ locResults: [] });
		  }
	},

	setLocResults: (value) => set({ locResults: value }),

	setLocAuthorization: (status) => set({ has_allowed_loc: status }),

}));