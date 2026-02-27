import express from 'express';
import { protectedRoute, protectedConfirm } from '../middleware/auth.js';
import { changeEmail, updateEmail, reportUser, getLikes, setNotificationAsSeen, updateOnline,
    getNotifications, getViews, getViewed, addOneView, updateProfile, updateLocation, restoreDislikedProfile,
    getLocationFromIp, getUserProfile, deletePicture, selectProfilePicture, searchLoc, getOnlineStatus } from '../controllers/userController.js';

const router = express.Router();

router.put("/update", protectedRoute, updateProfile)
router.put("/restore", protectedRoute, restoreDislikedProfile)
router.put("/update/picture/delete", protectedRoute, deletePicture)
router.put("/update/picture/select", protectedRoute, selectProfilePicture)
router.put("/update/email", protectedRoute, updateEmail)
router.put("/online", protectedRoute, updateOnline)
router.get("/online/:userId", protectedRoute, getOnlineStatus)
router.put("/location", protectedRoute, updateLocation)
router.get("/location", protectedConfirm, getLocationFromIp)
router.put("/addviews", protectedRoute, addOneView)
router.put("/report", protectedRoute, reportUser)
// get the views that one profile received
router.get("/history/views", protectedRoute, getViews)
// get the views that one user has done
router.get("/history/viewed", protectedRoute, getViewed)
router.get("/likes", protectedRoute, getLikes)
router.get("/notification", protectedRoute, getNotifications)
router.put("/notification/seen", protectedRoute, setNotificationAsSeen)
router.get("/:username", protectedRoute, getUserProfile)
router.get("/reset-email/:token", protectedRoute, changeEmail);
router.get("/search-loc/:query", protectedRoute, searchLoc);

export default router;