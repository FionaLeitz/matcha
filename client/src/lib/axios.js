import axios from "axios";

const IP = import.meta.env.VITE_IP
const BASE_URL = import.meta.env.MODE === "development" ? `http://${IP}:5000/api` : "/api";

export const axiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
})
