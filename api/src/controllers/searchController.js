import { findUsersFromSearch } from '../models/dbQueries.js'
import { getConnectedUsers } from "../socket/socket.server.js";

export const search = async (req, res) => {
    const { query = "", minAge = 18, maxAge = 100, minFame = 0, maxFame = 100, selectedTags = "", distance = -1 } = req.query;

    try {
		const agemin = Number(minAge);
		const agemax = Number(maxAge);
		if (!minAge || !maxAge || isNaN(agemin) || isNaN(agemax)) {
			return res.status(400).json({
				success: false,
				message: "Invalid age."
			});
		}

		const famemin = Number(minFame);
		const famemax = Number(maxFame);
		if (!minFame || !maxFame || isNaN(famemin) || isNaN(famemax)) {
			return res.status(400).json({
				success: false,
				message: "Invalid fame."
			});
		}

		const dist = Number(distance);
		if (!distance || isNaN(dist)) {
			return res.status(400).json({
				success: false,
				message: "Invalid distance."
			});
		}

		if (query.length > 255)
			return res.status(400).json({
				success: false,
				message: "Query exceeds 255 char limit.",
			});
        const ageGap = {minAge, maxAge};
		const fameGap = {minFame, maxFame};
        const users = await findUsersFromSearch(query, ageGap, fameGap, (selectedTags ? selectedTags.split(",") : []), req.user.latitude, req.user.longitude, distance);
		const connectedUsers = getConnectedUsers();
		const usersWithStatus = users.map(user => ({
			...user,
			is_connected: connectedUsers.has(user.id)
		}));

		const filteredUsers = usersWithStatus.filter(user => !req.user.blocked.includes(user.id));

		res.status(200).json({
			success: true,
			users: filteredUsers
		});
    } catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
    }
};

