import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import { createNotification, findUserById, updateUserBlocked, updateUserUnblocked, updateUserLikes,
	updateUserMatches, updateUserDislikes, unlikeUser, getUserMatches, getUsersToLike, createChat,
	findChatByUsers } from '../models/dbQueries.js'
import { getUserNearbyUsers } from '../models/dbQueries.js'

export const blockUser = async (req, res) => {
	try {
		const {blockedUserId} = req.params;

		const userIdNumber = Number(blockedUserId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (Number(blockedUserId) === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't block yourself"
			});
		}

		const blockedUser = await findUserById(blockedUserId);
		if (!blockedUser) {
			return res.status(404).json({
				success: false,
				message: "User with id " + blockedUserId + " do not exists."
			});
		}

		if (req.user.id != Number(blockedUserId)) {
			await updateUserBlocked(req.user.id, blockedUserId);
		}

		res.status(200).json({
			success: true
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error blocking profile",
			})
		}
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const unblockUser = async (req, res) => {
	try {
		const {unblockedUserId} = req.params;
		
		const userIdNumber = Number(unblockedUserId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (Number(unblockedUserId) === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't unblock yourself"
			});
		}
		const unblockedUser = await findUserById(unblockedUserId);
		if (!unblockedUser) {
			return res.status(404).json({
				success: false,
				message: "User with id " + unblockedUserId + " do not exists."
			});
		}

		if (req.user.id != Number(unblockedUserId))
			await updateUserUnblocked(req.user.id, unblockedUserId);

		res.status(200).json({
			success: true
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const swipeRight = async (req, res) => {
	try {
		const { likedUserId } = req.params;

		const userIdNumber = Number(likedUserId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}
		
        const currentUser = await findUserById(req.user.id);
        const likedUser = await findUserById(likedUserId);

	
		if (!likedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

		if (!currentUser.image) {
			return res.status(404).json({
				success: false,
				message: "Current user needs a profile picture"
			});
		}

		if (likedUser.id === currentUser.id) {
			return res.status(404).json({
				success: false,
				message: "You can't like yourself"
			});
		}

		if (!currentUser.likes.includes(likedUser.id)) {
			await updateUserLikes(currentUser.id, likedUser.id);

			const connectedUsers = getConnectedUsers();
			const io = getIO();

			if (likedUser.likes.includes(currentUser.id)) {
				await updateUserMatches(currentUser.id, likedUser.id);
				if (!( await findChatByUsers(currentUser.id, likedUser.id))) {
                	await createChat(currentUser.id, likedUser.id);
				}

				const likedUserSocketId = connectedUsers.get(likedUser.id);

				if (!likedUser.blocked.includes(req.user.id)) {
					if (likedUserSocketId) {
						const notification = await createNotification('match', currentUser.username, likedUser.username, true);
						io.to(likedUserSocketId).emit("newMatch", {
							id: currentUser.id,
							username: currentUser.username,
						});
					}
					else
					{
						const notification = await createNotification('match', currentUser.username, likedUser.username, false);
					}
				}

				const currentSocketId = connectedUsers.get(currentUser.id);


				if (!currentUser.blocked.includes(likedUser.id)) {
					if (currentSocketId) {
						const notification = await createNotification('match', likedUser.username, currentUser.username, true);
						io.to(currentSocketId).emit("newMatch", {
							id: likedUser.id,
							username: likedUser.username,
						});
					}
					else
					{
						const notification = await createNotification('match', likedUser.username, currentUser.username, false);
					}
				}
			}
			else {
				const likedUserSocketId = connectedUsers.get(likedUser.id);
				if (!likedUser.blocked.includes(req.user.id)) {
					if (likedUserSocketId) {
						const notification = await createNotification('like', currentUser.username, likedUser.username, true);
						io.to(likedUserSocketId).emit("newLike", {
							id: currentUser.id,
							username: currentUser.username,
						});
					}
					else
					{
						const notification = await createNotification('like', currentUser.username, likedUser.username, false);
					}
				}
			}
		}
		res.status(200).json({
			success: true,
			user: currentUser
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error liking profile",
			})
		}
		if (error.message === "Update match failed") {
			return res.status(400).json({
				success: false,
				message: "Error liking profile",
			})
		}
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const swipeLeft = async (req, res) => {
	try {
		const { dislikedUserId } = req.params;
		
		const userIdNumber = Number(dislikedUserId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (Number(dislikedUserId) === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't dislike yourself."
			});
		}
		
        const dislikedUser = await findUserById(dislikedUserId);
		if (!dislikedUser) {
			return res.status(404).json({
				success: false,
				message: "User with id " + dislikedUserId + " do not exists."
			});
		}

        const currentUser = await findUserById(req.user.id);

		if (!currentUser.dislikes.includes(dislikedUserId)) {
			await updateUserDislikes(currentUser.id, dislikedUserId);
		}

		res.status(200).json({
			success: true,
			user: currentUser
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error disliking profile",
			})
		}
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const unlike = async (req, res) => {
	try {
		const { unlikedUserId } = req.params;

		const userIdNumber = Number(unlikedUserId);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (Number(unlikedUserId) === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't unlike yourself."
			});
		}
		const currentUser = await findUserById(req.user.id);
		const unlikedUser = await findUserById(unlikedUserId);
		if (!unlikedUser) {
			return res.status(404).json({
				success: false,
				message: "User with id " + unlikedUserId + " do not exists."
			});
		}
		const currentUserMatches = await getUserMatches(currentUser.id);

		await unlikeUser(currentUser.id, unlikedUser.id);

		const connectedUsers = getConnectedUsers();

		const io = getIO();
		const unlikedUserSocketId = connectedUsers.get(unlikedUser.id);
		if (!unlikedUser.blocked.includes(req.user.id)) {
			if (unlikedUserSocketId) {
				io.to(unlikedUserSocketId).emit("unLike", {});
			}
		}
		if (!unlikedUser.blocked.includes(req.user.id)) {
			if (currentUserMatches.some(match => match.username === unlikedUser.username)) {
				if (unlikedUserSocketId) {
					const notification = await createNotification('unmatch', currentUser.username, unlikedUser.username, true);
					io.to(unlikedUserSocketId).emit("unMatch", {
						id: currentUser.id,
						username: currentUser.username,
						image: currentUser.image,
					});
				} else {
					const notification = await createNotification('unmatch', currentUser.username, unlikedUser.username, false);
				}
			}
		}
		res.status(200).json({
			success: true,
			user: currentUser
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error unliking profile",
			})
		}
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
}

export const getMatches = async (req, res) => {
	try {
		const matches = await getUserMatches(req.user.id);
		res.status(200).json({
			success: true,
			matches,
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getNearbyUsers = async (req, res) => {
	try {
		const currentUser = await findUserById(req.user.id);
		const { id, latitude, longitude } = currentUser;
		const maxDistance = 1000;
		const nearbyUsers = await getUserNearbyUsers(id, latitude, longitude, maxDistance);
		res.status(200).json({
			success: true,
			nearbyUsers,
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

// get number of common tags
const getCommonTagsCount = (tags1, tags2) => {
	return tags1.filter(tag => tags2.includes(tag)).length;
};

// get tiers
const getDistanceTier = (distance) => {
	if (distance <= 5) return 1;
	if (distance <= 10) return 2;
	if (distance <= 15) return 3;
	if (distance <= 25) return 4;
	if (distance <= 50) return 5;
	return 6;
};

// sort function
const sortUsers = (users, currentUser) => {
	return users.sort((a, b) => {
		// sort by tier for distance, less thant 5 km, less than 10 km, 15, 25, 50 and more
		const tierA = getDistanceTier(a.distance);
		const tierB = getDistanceTier(b.distance);
		if (tierA !== tierB) {
			return (tierA - tierB);
		}

		// in tiers, first the users with a maximum of common tags
		const commonTagsA = getCommonTagsCount(a.tags, currentUser.tags);
		const commonTagsB = getCommonTagsCount(b.tags, currentUser.tags);
		if (commonTagsA !== commonTagsB) {
			return (commonTagsB - commonTagsA);
		}

		// in same number of common tags, a maximum of fame rating
		return (b.fame_rating - a.fame_rating);
	});
};

export const getUserProfiles = async (req, res) => {
	try {
        const currentUser = await findUserById(req.user.id);
		// get every user with corresponding genre and orientation
		const users = await getUsersToLike(currentUser);
		// get rid of blocked users
		const filteredUsers = users.filter(user => !req.user.blocked.includes(user.id));

		const maxDistance = 75;
		const { id, latitude, longitude } = currentUser;
		// get every users less than 75 km away
		const nearbyUsers = await getUserNearbyUsers(id, latitude, longitude, maxDistance);
		// keep only users that are less than 75 km away
		// with corresponding genre and orientation
		// and not blocked
		const usersToLike = filteredUsers.filter((filteredUser) =>
			nearbyUsers.some((nearbyUser) => nearbyUser.id === filteredUser.id)
		);

		// sort
		const connectedUsers = getConnectedUsers();
		const usersWithStatus = usersToLike.map(user => ({
			...user,
			is_connected: connectedUsers.has(user.id)
		}));
		const sortedUsers = sortUsers(usersWithStatus, currentUser);

		res.status(200).json ({
			success: true,
			users: sortedUsers,
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

