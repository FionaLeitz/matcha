import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast"
import { initializeSocket, disconnectSocket } from "../socket/socket.client";
import ResetPassword from "../pages/AskToResetPassword";
import { useNotificationStore } from "./useNotificationStore";
import { sanitize } from "../utils/sanitize";

export const useAuthStore = create((set, get) => ({
	verifResponse: '',
	resendVerifResponse: '',
	resetPasswordResponse: '',
	authUser: null,
	isAuthentified: false,
	isVerified: false,
	checkingAuth: true,
	loading: false,
    checker: "",

	signup: async(signupData) => {
		try {
			set({loading: true});

			const san = await sanitize('^[0-9a-zA-Z-_\']+$', 42, [signupData.first_name, signupData.last_name, signupData.username]);
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

			const san2 = await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, [signupData.password, signupData.email]);
			if (san2.success === false)
			{
				if (san2.message == "forbidden char") {
					toast.error("Forbidden char in email or password.");
					return ;
				}
				if (san2.message == "length") {
					toast.error("Email or password too long.");
					return ;
				}
			}

			const res = await axiosInstance.post("/auth/signup", signupData);
			set({
				authUser: res.data.user,
				isAuthentified: true
			});

			// useNotificationStore.getState().createSocket(res.data.user.id);
			// initializeSocket(res.data.user.id);
			// set({ isSocketReady: true });
			toast.success("Account created successfully");
			return true;
		} catch (error) {
            if (error.status === 403)
                set({checker: error?.response?.data?.message || "Password too weak"});
            else
			    toast.error(error?.response?.data?.message || "Something went wrong");
		} finally {
			set({loading: false});
		}
	},

	login: async(loginData) => {
		try {
			set({loading: true});

			const san = await sanitize('^[0-9a-zA-Z-_\']+$', 42, loginData.username);
			const san2 = await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, loginData.password);
			if (san.success === false || san2.success === false)
			{
				toast.error("Invalid username or password.");
				return ;
			}

			const res = await axiosInstance.post("/auth/login", loginData);
			set({
				authUser: res.data.user,
				isAuthentified: true
			});
			if (res?.data?.user?.is_verified)
				set({isVerified: true});
			useNotificationStore.getState().createSocket(res.data.user.id);
			// initializeSocket(res.data.user.id);
			// set({ isSocketReady: true });
			toast.success("Logged in successfully");
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			set({loading: false});
		}
	},

	logout: async() => {
		try {
			useNotificationStore.getState().unsubscribeFromNotifications();
			disconnectSocket();
			localStorage.removeItem('locasked');
			localStorage.removeItem('locallowed');
			const res = await axiosInstance.post("/auth/logout");
			if (res.status === 200)
				set({
					authUser: null,
					isAuthentified: false,
					isVerified: false,
				  });
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		}
	},

	checkAuth: async () => {
		try {
			// const isVerified = get().isVerified;
			const res = await axiosInstance.get("/auth");
			set({
				authUser: res.data.user,
				isAuthentified: res.data.isAuthentified,
				isVerified: res.data.isVerified
			});
			if (res.data.user && res.data.user.is_verified)
				useNotificationStore.getState().createSocket(res.data.user.id);
			// 	initializeSocket(res.data.user.id);

		} catch (error) {
			set({
				authUser: null,
				isAuthentified: false,
				isVerified: false,
			});
		} finally {
			set({ checkingAuth: false });
		}
	},

	resendVerificationEmail: async () => {
		try {
			const res = await axiosInstance.get("/auth/resend-verif");
			set({resendVerifResponse: res.data.message || "An email has been send"})
			return true;
		} catch (error) {
			set({ resendVerifResponse: error.response.data.message || "An error occured"});
			return false;
		}
	},

	callVerif: async (token) => {
        // const user = get().authUser;
		try {
			const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
			set({ verifResponse: res.data.message });
			if (res.status === 200)
				set({isVerified: true});
		} catch (error) {
			set({ verifResponse: error.response.data.message || "An error occured"});
		}
	},

	callResetPassword: async (token, password) => {
		try {
			const san = await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, password);
			if (san.success === false)
			{
				if (san.message == "forbidden char") {
					toast.error("Forbidden char in password.");
					return ;
				}
				if (san.message == "length") {
					toast.error("Password too long.");
					return ;
				}
			}
			const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
			const message = res.data.message || "Success";
			toast.success(message);
			return true;
		} catch (error) {
			if (error.status === 403)
                set({checker: error?.response?.data?.message} || "Password too weak");
            else
			    toast.error(error?.response?.data?.message || "Something went wrong");
			return false;
		}
	},

	sendResetPasswordEmail: async(email) => {
		try {
			const san = await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, email);
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

			const res = await axiosInstance.post(`/auth/forgot-password`, { email });
			toast.success(res.data.message);
		} catch (error) {
            if (error.status === 403)
                set({checker: error?.response?.data?.message || "Password too weak"});
            else
			    toast.error(error?.response?.data?.message || "Something went wrong");
		} finally {
			set({loading: false});
		}
	},

	setAuthUser: (user) => set({ authUser: user }),

}));
