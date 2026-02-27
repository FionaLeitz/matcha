import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast'
import { useAuthStore } from "./useAuthStore";
import { sanitize } from "../utils/sanitize";

export const useSearchStore = create((set, get) => ({
	ageRange: [],
	fameRange: [],
	selectedTags: [],
	selectedDistance: 500,
	activeDistance: false,
	searchQuery: "",
    usersFound: [],
    usersFoundSorted: [],
	// tagsFound: [],
	isLoading: false,

	// sort function, will sort usersFound shown according to the user's choice
    sortUsersFound: (sortType) => {
        const usersFound = get().usersFound;
		// no sort option selected, then sort by signup date
		// if there is a searchQuery, first will be users with name starts with the query
		// sorted by signup date
		// then the others, sorted by signup date
        if (sortType === "") {
			const query = get().searchQuery.toLowerCase();
			// sort takes a comparison function as an argument, that defines how to sort its elements
			const tmp = [...usersFound].sort((a, b) => {

				// returns true if name starts with the searchQuery
				const startsWithQueryA = a.username.toLowerCase().startsWith(query);
				const startsWithQueryB = b.username.toLowerCase().startsWith(query);

				// if first element starts with query and not second element
				// returns -1 so first element comes before second element
				if (startsWithQueryA && !startsWithQueryB)
					return -1;
				// if second element starts with query and not first element
				// returns -1 so second element comes before first element
				if (!startsWithQueryA && startsWithQueryB)
					return 1;

				// in other cases (they both start wirh query or both don't)
				// returns a minus number if first element has signed up more recently than second element
				// and so first element comes before second element
				// and vice versa
				return new Date(b.created_at) - new Date(a.created_at);
			});
			set({ usersFoundSorted: tmp });
        }
		// sort by age
		// from younger to older
		else if (sortType === "age") {
            const tmp = [...usersFound].sort((a, b) => a.age - b.age);
            set({usersFoundSorted: tmp})
        }
		// sort by tag, witch is the version given by the database
		// will sort by number of tags corresponding to the filter used
		// if users have the same number of tags corresponding, will sort by the searchQuery
		// (first name starting with the query, then other)
		// then by signup date
		else if (sortType === "tag") {
            set({usersFoundSorted: usersFound})
		}
		// sort by fame
		else if (sortType === "fame rating") {
			const tmp = [...usersFound].sort((a, b) => {
				const ratioA = a.likes.length === 0 ? 0 : a.match_nbr / a.likes.length;
				const ratioB = b.likes.length === 0 ? 0 : b.match_nbr / b.likes.length;
				return ratioB - ratioA;
			});
            set({usersFoundSorted: tmp})
		}
		// sort by distance
		else if (sortType === "distance") {
            const tmp = [...usersFound].sort((a, b) => a.distance - b.distance);
            set({usersFoundSorted: tmp})
        }
    },

	// function that will get the parameters in the url
	// and save them in this store, to be used by other functions
	// and updated in the front
	syncWithURL: (searchParams) => {
		const query = searchParams.get("query") || "";
		const ageRange = [
			searchParams.get("minAge") || "18",
			searchParams.get("maxAge") || "100"
		];
		const fameRange = [
			searchParams.get("minFame") || "0",
			searchParams.get("maxFame") || "100"
		];
		const selectedTags = searchParams.get("selectedTags") 
			? searchParams.get("selectedTags").split(",") 
			: [];
		const selectedDistance = searchParams.get("distance") || "-1"
		set({
			searchQuery: query,
			ageRange: ageRange,
			fameRange: fameRange,
			selectedTags: selectedTags,
			selectedDistance: selectedDistance,
		});
	},
	
	// function that will change page to go to the searchPage
	// will give access to parameters like searchQuery, ageRange and selectedTags
    goToSearch: async (searchQuery, ageRange, fameRange, selectedTags, selectedDistance, activeDistance, navigate) => {
		set({
			isLoading: true,
			ageRange: ageRange,
			fameRange: fameRange,
			selectedTags: selectedTags,
			searchQuery: searchQuery,
			selectedDistance: selectedDistance,
			activeDistance: activeDistance
		});
        try {
			const san = await sanitize('^[0-9a-zA-Z-_]+$', 255, searchQuery);
			if (san.success === false)
				navigate('/search');
			
			const params = new URLSearchParams();
			if (searchQuery) {
				params.append("query", searchQuery);
			}
			if (ageRange[0]) {
				params.append("minAge", ageRange[0]);
			}
			if (ageRange[1]) {
				params.append("maxAge", ageRange[1]);
			}
			if (fameRange[0]) {
				params.append("minFame", fameRange[0]);
			}
			if (fameRange[1]) {
				params.append("maxFame", fameRange[1]);
			}
			if (selectedTags && selectedTags.length > 0) {
				params.append("selectedTags", selectedTags.join(","));
			}
			if (activeDistance) {
				params.append("distance", selectedDistance);
			}

			const url = `/search?${params.toString()}`;
            navigate(url);
        } catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    		toast.error(errorMessage);
        } finally {
			set({isLoading: false});
		}
    },

	// gets result for a search that can have
	// a searchQuery (search in names and in tag names)
	// an age range (for users)
	// a array of tag names (for users)
	// the list given will be sorted per signup dates
	// with users starting with the searchQuery first
    getResults: async (searchQuery, ageRange, fameRange, selectedTags, selectedDistance) => {
		set({isLoading: true});
        try {
			const params = new URLSearchParams();

			if (searchQuery) {
				params.append("query", searchQuery);
			}
			if (ageRange[0]) {
				params.append("minAge", ageRange[0]);
			}
			if (ageRange[1]) {
				params.append("maxAge", ageRange[1]);
			}
			if (fameRange[0]) {
				params.append("minFame", fameRange[0]);
			}
			if (fameRange[1]) {
				params.append("maxFame", fameRange[1]);
			}
			if (selectedTags && selectedTags.length > 0) {
				params.append("selectedTags", selectedTags.join(","));
			}
			if (selectedDistance >= 0) {
				params.append("distance", selectedDistance);
			}

			const url = `/search?${params.toString()}`;
			const res = await axiosInstance.get(url);

			set({
				usersFound: res.data.users,
				// tagsFound: res.data.tags
			});
			get().sortUsersFound("");
        } catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
    		toast.error(errorMessage);
        } finally {
			set({isLoading: false});
		}
    },

}));