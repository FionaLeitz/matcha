import cloudinary from "../config/cloudinary.js";
import { sendEmail } from '../config/email.js';
import crypto from 'crypto';
import { findUserByEmailChangeToken, updateUserEmail, pendingEmail, findUser, addReportProfile, getLikesForUserId,
	setNotificationIdAsSeen, createNotification, getNotificationsForUsername, getViewsOfViewed, getViewsFromViewer,
	createView, getViewFromViewerToViewed, addView, updateUserProfile, updateUserLocation, updateUserCity,
	findUserByUsername, findUserById, deletePictureFromUser, setProfilePicture, updateLastConnection, emptyDislikes } from '../models/dbQueries.js'
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import { transporter, mailOptions } from '../config/email.js';
import dotenv from "dotenv";
import { sanitize } from "./authController.js";

dotenv.config();

export const restoreDislikedProfile = async (req, res) => {
	try {
		await emptyDislikes(req.user.id);
		res.status(200).json({
			success: true
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
}

export const getOnlineStatus = (req, res) => {
	try {
		const connectedUsers = getConnectedUsers();
		const { userId } = req.params;
		const userSocketId = connectedUsers.get(Number(userId));
		let is_connected;
		if (userSocketId)
			is_connected = true;
		else
			is_connected = false
		res.status(200).json({
			success: true,
			is_connected
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const updateOnlineFromBack = async (userId) => {
	try {
		await updateLastConnection(userId);
		return ({
			success: true
		})
	} catch (error) {
		return ({
			success: false,
			message: "Unknown server error",
		});
	}
}

export const updateOnline = async (req, res) => {
	try {
		const result = await updateLastConnection(req.user.id);
		res.status(200).json({
			success: true
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const reportUser = async (req, res) => {
	try {
		const { reported_id, reported_username} = req.body;

		const userIdNumber = Number(reported_id);
		if (isNaN(userIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user ID."
			});
		}

		if (!reported_id || !reported_username) {
			return res.status(404).json({
				success: false,
				message: "Reported user is empty."
			});
		}

		const reported = await findUserById(reported_id);
		if (!reported) {
			return res.status(404).json({
				success: false,
				message: "User with id " + reported_id + " do not exists."
			});
		}

		const reported_by = (await addReportProfile(Number(reported_id), req.user.id)).reported_by;


		if (reported_id === req.user.id) {
			return res.status(404).json({
				success: false,
				message: "You can't report yourself"
			});
		}

		if (reported_by.length >= 5) {
			const html = `
					<h1>${reported_username}, might be fake?</h1>
					<p>Please proceed with a verification of the user ${reported_username}, whose ID is ${reported_id}.</p>
				`;
			try {
				await transporter.sendMail(mailOptions(process.env.EMAIL_USER, "Fake user?", html));
			} catch (error) {
				throw new Error("Imposible to send fake user email.");
			}
		}

		res.status(200).json({
			success: true
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getLikes = async (req, res) => {
	try {
		const likes = await getLikesForUserId(req.user.id);

		res.status(200).json({
			success: true,
			likes
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getNotifications = async (req, res) => {
	try {
		const notifications = await getNotificationsForUsername(req.user.username);
		const filteredNotifications = notifications.filter(notification => !req.user.blocked.includes(notification.sender_id));
		const not_seen = filteredNotifications.filter(notification => notification.seen === false).length;

		res.status(200).json({
			success: true,
			notifications: filteredNotifications,
			not_seen
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const setNotificationAsSeen = async (req, res) => {
	try {
		const { notification_id } = req.body;

		if (!notification_id) {
			return res.status(404).json({
				success: false,
				message: "Notification ID is empty."
			});
		}
		const notifIdNumber = Number(notification_id);
		if (isNaN(notifIdNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid notification ID."
			});
		}
		const notification = await setNotificationIdAsSeen(notification_id);

		res.status(200).json({
			success: true,
			res: notification.data
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const addOneView = async (req, res) => {
	try {
		if (req.body.viewed_username === req.user.username) {
			return res.status(404).json({
				success: false,
				message: "We don't count your views on yourself"
			});
		}

		let views;
		const oldViews = await getViewFromViewerToViewed(req.user.username, req.body.viewed_username)
		if (oldViews.length === 0)
			views = await createView(req.user.username, req.body.viewed_username);
		else 
			views = await addView(req.user.username, req.body.viewed_username);

		const viewedUser = await findUserByUsername(req.body.viewed_username);
		if (!viewedUser) {
			return res.status(404).json({
				success: false,
				message: "User " + req.body.viewed_username + " do not exist."
			});
		}

		const connectedUsers = getConnectedUsers();
		const io = getIO();

		const viewedUserSocketId = connectedUsers.get(viewedUser.id);
		if (!viewedUser.blocked.includes(req.user.id)) {
			if (viewedUserSocketId) {
				const notification = await createNotification('view', req.user.username, viewedUser.username, true);
				io.to(viewedUserSocketId).emit("newView", {
					id: req.user.id,
					username: req.user.username,
				});
			}
			else
			{
				const notification = await createNotification('view', req.user.username, viewedUser.username, false);
			}
		}

		res.status(200).json({
			success: true,
			views
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getViews = async (req, res) => {
	try {
		const views = await getViewsOfViewed(req.user.username);
		const filteredViews = views.filter(view => !req.user.blocked.includes(view.viewer_id));
		res.status(200).json({
			success: true,
			views: filteredViews
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getViewed = async (req, res) => {
	try {
		const views = await getViewsFromViewer(req.user.username);
		const filteredViews = views.filter(view => !req.user.blocked.includes(view.viewed_id));
		res.status(200).json({
			success: true,
			views: filteredViews
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const getUserProfile = async(req, res) => {
    try {
		const { username } = req.params;
		if (!username) {
			return res.status(404).json({
				success: false,
				message: "Username is empty."
			});
		}
		const userProfile = await findUserByUsername(username, req.user.latitude, req.user.longitude);
		if (!userProfile) {
			return res.status(404).json({
				success: false,
				message: "User do not exist."
			});
		}
		const {
			id, first_name, last_name, gender, gender_preference, age, bio, image, distance, birthday,
			images, likes, tags, match_nbr, city, loc, last_connection, updated_at, reported_by, created_at
		} = userProfile;
		  
		const filteredProfile = { 
			id, username, first_name, last_name, gender, gender_preference, age, bio, image, distance, birthday,
			images, likes, tags, match_nbr, city, loc, last_connection, updated_at, reported_by, created_at
		};

		res.status(200).json({
			success: true,
			userProfile: filteredProfile
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const deletePicture = async(req, res) => {
	try {
        const {image} = req.body;
		if (!image) {
			return res.status(404).json({
				success: false,
				message: "Image is empty."
			});
		}
		const userProfile = await deletePictureFromUser(image, req.user.id);

		res.status(200).json({
			success: true,
			user: userProfile
		});
		
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const selectProfilePicture = async(req, res) => {
	try {
        const { image } = req.body;
		if (!image) {
			return res.status(404).json({
				success: false,
				message: "Image is empty."
			});
		}
		const userProfile = await setProfilePicture(image, req.user.id);

		res.status(200).json({
			success: true,
			user: userProfile
		});
		
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Unknown server error",
		});
	}
};

export const updateLocation = async(req, res) => {
    const apiKey = process.env.OPENCAGE_API_KEY;
    let city;
    let loc;
	let updatedUser;

    try {
        const { latitude, longitude, authorization } = req.body;
        const resLoc = await updateUserLocation(req.user.id, {latitude: latitude, longitude: longitude}, authorization);
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=fr&no_annotations=1`;
        try {
            const cityRes = await fetch(url);
            if (!cityRes.ok && cityRes.status != 402) {
                throw new Error(`HTTP error! Status: ${cityRes.status}`);
            }
            if (cityRes.status == 402) {
                city = "Plus-de-credits-city";
                loc = null;
            }
            else {
                const data = await cityRes.json();
                loc = data.results[0];
                city = loc?.components.city || 
                    loc?.components.town ||
                    loc?._normalized_city ||
                    loc?.components.village || 
                    loc?.components.county || 
                    loc?.components.state || 
                    loc?.components.municipality || 
                    loc?.components.shipping_forecast_sea_area || 
                    loc?.components.body_of_water ||
                    "Inconnue";
            }
            updatedUser = await updateUserCity(req.user.id, city, loc);
            } catch (error) {
            return "Inconnue3";
        }
        return res.status(200).json({
            success: true,
            latitude,
            longitude,
            city,
            loc,
			updatedUser
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
			message: "Error uploading location",
		});
    };
};

export const getLocationFromIp = async(req, res) => {
    try {
		const ipInfoToken = process.env.IPINFO_TOKEN;

		const { ip } = req.query;

        if (!ip) {
			return res.status(400).json({
				success: false,
				message: "No ip provided"
			});
        }

        const response = await fetch(`https://ipinfo.io/${ip}/json?token=${ipInfoToken}`);
		const data = await response.json();
		const latitude = data.loc.split(',')[0];
		const longitude = data.loc.split(',')[1];

		res.status(200).json({
			success: true,
			latitude,
			longitude,
		})
    } catch (error) {
        return res.status(400).json({
            success: false,
		});
    }
};

export const searchLoc = async (req, res) => {
	try {
		const { query } = req.params;
		const API_KEY = process.env.OPENCAGE_API_KEY;
		
		const api_res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=5&language=fr`);
		const data = await api_res.json();
		res.status(200).json({ results: data.results });
	} catch (error) {
		res.status(400).json({ success: false, results: [] });
  }
};

export const updateProfile = async (req, res) => {
	try {
		const { image, ...otherData } = req.body;
		let updatedData = otherData;
		
		await sanitize('^[0-9a-zA-Z-_\']+$', 42, [updatedData.username, updatedData.last_name, updatedData.first_name]);
		if(updatedData.bio) {
			const regex = new RegExp('^[\\p{L}\\p{N}\\s\\p{Emoji_Presentation}\\-_!?,.$#^&*=+:;~@\'\\s]+$', 'u');
			await sanitize(regex, 255, updatedData.bio);
		}

		if (image && req.user.images.length < 5 && image.startsWith("data:image")) {
			// base64 format
			if (image.startsWith("data:image")) {
				try {
					const uploadResponse = await cloudinary.uploader.upload(image);
					updatedData.image = uploadResponse.secure_url;
				} catch (error) {

					return res.status(400).json({
						success: false,
						message: "Error uploading image",
					});
				}
			}
		}

		let updatedUser;
		try {
			updatedUser = await updateUserProfile({
				userId: req.user.id,
				...updatedData
			});
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: "Error updating profile",
			});
		}

		res.status(200).json({
			success: true,
			user: updatedUser,
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

export const updateEmail = async(req, res) => {
	try {
        const { newEmail } = req.body;

		await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, newEmail);
		
		if (await findUser(newEmail))
			res.status(400).json({
				success: false,
				message: "Email is already taken."
			});
		
		const token = crypto.randomBytes(32).toString('hex');
		const exp = Math.floor(new Date().getTime() / 1000) + 60 * 60; // 1 heure

		const updatedUser = await pendingEmail(newEmail, token, exp, req.user.id);
		// if pas updatedUser
		const verificationUrl = `${process.env.CLIENT_URL}/reset-email/${token}`;
  
		const html = `
			<h1>Matcha - Email Change Request</h1>
			<p>Hello ${updatedUser.username}. We have received a request to change the email address for you account.
			To confirm this change, please click on the link below:</p>
			<a href="${verificationUrl}">Verify my email</a>
			<p>Note: this link is valid for 1 hour.</p>
			<p>If you did not request this change, you can ignore this email. Your current mail will remain unchanged.</p>
		`;

		await sendEmail(newEmail, "Confirm your email change", html);

		res.status(200).json({
			success: true,
			user: updatedUser,
			message: "Almost there! Please confirm your email change via the link we emailed you."
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

export const changeEmail = async (req, res) => {
	try {
		const { token } = req.params;

		if (!token) {
			return res.status(400).json({ message: "No token provided." });
		}

		// check if token exists and is not expired
		const user = await findUserByEmailChangeToken(token);

		if (!user) {
			return res.status(400).json({ message: 'Token is invalid or has expired.' });
		}

		const updatedUser = await updateUserEmail(user.id);

		res.status(200).json({
			success: true,
			message: 'Email successfully updated.',
			user: updatedUser
		});
	} catch (error) {
		res.status(400).json({ success: false, message: "Unkwown error in changeEmail" });
	}
};
