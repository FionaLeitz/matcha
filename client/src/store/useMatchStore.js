import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { getSocket } from '../socket/socket.client'
import { useAuthStore } from "./useAuthStore";

export const useMatchStore = create((set, get) => ({
	matches: [],
	isLoadingMyMatches: false,
	isLoadingUserProfiles: false,
	rawUserProfiles: [],
	userProfiles: [],
	sortedUserProfiles: [],
	swipeFeedback: null,
	isChangingStatus: false,

	// function to add a new match at the same time as the notification
	addMatch: (newMatch) => {
		set(state => {
			const matchExists = state.matches.some(match => match.id === newMatch.id);
			if (matchExists) {
				return state; // Pas de changement si déjà présent
			}
			return {
				matches: [...state.matches, newMatch],
			};		  
		})
	},

	// function to remove an old match at the same time as the notification
	removeMatch: (matchId) => {
		set(state => ({
			matches: state.matches.filter((match) => match.id !== matchId),
		}))
	},

	block: async (user) => {
		try {
			await axiosInstance.post("/matches/blocked/" + user.id);
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		}
	},

	unblock: async (user) => {
		try {
			await axiosInstance.post("/matches/unblocked/" + user.id);
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		}
	},

	applyFilterToUsers: async (ageRange, fameRange, distanceSelected, tags, isDistanceFilterActive, sort) => {
		let tmp = get().rawUserProfiles;
		try {
			set({isLoadingUserProfiles: true});
			tmp = tmp.filter(user => user.age >= ageRange[0]);
			tmp = tmp.filter(user => user.age <= ageRange[1]);
			tmp = tmp.filter(user =>
				(user.likes.length > 0 ? (user.match_nbr / user.likes.length) * 100 : 0) >= fameRange[0]
			);
			tmp = tmp.filter(user =>
				(user.likes.length > 0 ? (user.match_nbr / user.likes.length) * 100 : 0) <= fameRange[1]
			);
			if (distanceSelected >= 0 && isDistanceFilterActive) {
				tmp = tmp.filter(user => user.distance <= distanceSelected);
			}
			if (tags.length != 0)
				tmp = tmp.filter(user => user.tags.some(tag => tags.includes(tag)));
			set({ userProfiles: tmp })
			get().sortUsers(sort, tags)
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		} finally {
			set({isLoadingUserProfiles: false});
		}
	},

	getMyMatches: async () => {
		try {
			set({isLoadingMyMatches: true});
			const res = await axiosInstance.get("/matches");
			set({matches: res.data.matches});
		} catch (error) {
			set({matches: []});
			toast.error(error.response.data.message || "Something went wrong");
		} finally {
			set({isLoadingMyMatches: false});
		}
	},

	sortUsers: (sort, tags) => {
		try {
			set({isLoadingUserProfiles: true});
			const users = get().userProfiles;

			if (sort === "") {
				set({sortedUserProfiles: users});
			}
			else if (sort === "age") {
				const tmp = [...users].sort((a, b) => a.age - b.age);
				set({ sortedUserProfiles: tmp })
			} else if (sort === "tag") {
				const getCommonTagsCount = (tags1, tags2) => {
					return tags1.filter(tag => tags2.includes(tag)).length;
				};
				const tmp = [...users].sort((a, b) => getCommonTagsCount(b.tags, tags) - getCommonTagsCount(a.tags, tags));
				set({ sortedUserProfiles: tmp })
			} else if (sort === "fame rating") {
				const tmp = [...users].sort((a, b) => {
					const ratioA = a.likes.length === 0 ? 0 : a.match_nbr / a.likes.length;
					const ratioB = b.likes.length === 0 ? 0 : b.match_nbr / b.likes.length;
					return ratioB - ratioA;
				});
				set({ sortedUserProfiles: tmp })
			} else if (sort === "distance") {
				const tmp = [...users].sort((a, b) => a.distance - b.distance);
				set({ sortedUserProfiles: tmp })
			}
		} catch (error) {
			set({sortedUserProfiles: []});
			toast.error(error.response.data.message || "Something went wrong");
		} finally {
			set({isLoadingUserProfiles: false});
		}
	},

	getUserProfile: async () => {
		try {
			set({isLoadingUserProfiles: true});
			const res = await axiosInstance.get("/matches/user-profiles");

            const users = res.data.users;
			set({ rawUserProfiles: users });
			set({ userProfiles: users });
			set({ sortedUserProfiles: users });
		} catch (error) {
			set({rawUserProfiles: []});
			toast.error(error.response.data.message || "Something went wrong");
		} finally {
			set({isLoadingUserProfiles: false});
		}
	},

	unlike: async (user) => {
		try {
			set({isChangingStatus: true});
			const res = await axiosInstance.post("/matches/unlike/" + user.id);
			useAuthStore.getState().setAuthUser(res.data.user);
		} catch (error) {
			toast.error("Failed to unlike");
		} finally {
			set({isChangingStatus: false});
		}
	},

	like: async (user) => {
		try {
			set({isChangingStatus: true});
			const res = await axiosInstance.post("/matches/swipe-right/" + user.id);
			useAuthStore.getState().setAuthUser(res.data.user);
		} catch (error) {
			toast.error("Failed to like");
		} finally {
			set({isChangingStatus: false});
		}
	},

	swipeLeft: async (user) => {
		try {
			set({ swipeFeedback: "passed" })
			await axiosInstance.post("/matches/swipe-left/" + user.id);
		} catch (error) {
			toast.error("Failed to swipe left");
		} finally {
			setTimeout(() => set({swipeFeedback: null}), 1500);
		}
	},

	swipeRight: async (user) => {
		try {
			const authUser = useAuthStore.getState().authUser;
			if (authUser.image) {
				set({ swipeFeedback: "liked" })
				await axiosInstance.post("/matches/swipe-right/" + user.id);
			} else {
				set({ swipeFeedback: "unauthorized"});
			}
		} catch (error) {
			toast.error("Failed to swipe right");
		} finally {
			setTimeout(() => set({swipeFeedback: null}), 1500);
		}
	},
}));