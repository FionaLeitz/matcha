import { createTag, createUsersTags, getPopularTags, getSimilarTags, getUserTags, suppressTagFromUser,
	getTagOccurence, suppressTag } from '../models/dbQueries.js'
import { sanitize } from './authController.js';

export const addTag = async(req, res) => {
	try {
		const { tag_name } = req.body;

		if (!tag_name || tag_name === '') {
			return res.status(402).json({
				success: false,
				message: "No tag received"
			});
		}

		const tag = await createTag(tag_name);

		res.status(200).json({
			success: true,
			tag
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const assignTagToUser = async(req, res) => {
	try {
		const { tag_name } = req.body;

		if (!tag_name || tag_name === '') {
			return res.status(402).json({
				success: false,
				message: "No tag received"
			});
		}

		const usersTags = await createUsersTags(req.user.id, tag_name);

		res.status(200).json({
			success: true,
			usersTags
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error adding tag",
			})
		}
		("Error in addUsersTags: ", error);
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const popularTags = async(req, res) => {
	try {
		const popularTags = await getPopularTags()
		res.status(200).json({
			success: true,
			popularTags
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const similarTags = async(req, res) => {
	try {
		const { tag_name } = req.params;

		await sanitize('^[0-9a-zA-Z-_]+$', 255, tag_name);

		const similarTags = await getSimilarTags(tag_name);
		res.status(200).json({
			success: true,
			similarTags
		});
	} catch (error) {
		let message;
		if (error.code && error.detail) // postgre error
			message = error.detail.replace(/Key|\(|\)|'|'/g, '').replace(/=/g, ' ');
		else
			message = error?.response?.data?.message;
		res.status(400).json({
			success: false,
			message
		});
	}
};

export const userTags = async(req, res) => {
	try {
		const { user_id } = req.params;
		
		const userIdNumber = Number(user_id);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		const userTags = await getUserTags(user_id);
		res.status(200).json({
			success: true,
			userTags
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const removeTagFromUser = async(req, res) => {
	try {
		const { tag_name } = req.body;
		await suppressTagFromUser(req.user.id, tag_name);
		const tagOccurence = await getTagOccurence(tag_name);
		if (tagOccurence.usage_count == 0) {
			await suppressTag(tag_name);
		}
		res.status(200).json({
			success: true,
		});
	} catch (error) {
		if (error.message === "Update failed") {
			return res.status(400).json({
				success: false,
				message: "Error suppressing tag",
			})
		}
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};