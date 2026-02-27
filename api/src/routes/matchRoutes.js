import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { blockUser, unblockUser, swipeRight, swipeLeft, unlike, getMatches, getUserProfiles } from '../controllers/matchController.js';

const router = express.Router();

router.post("/swipe-right/:likedUserId", protectedRoute, swipeRight)
router.post("/swipe-left/:dislikedUserId", protectedRoute, swipeLeft)
router.post("/unlike/:unlikedUserId", protectedRoute, unlike)
router.post("/blocked/:blockedUserId", protectedRoute, blockUser)
router.post("/unblocked/:unblockedUserId", protectedRoute, unblockUser)

router.get("/", protectedRoute, getMatches);
router.get("/user-profiles", protectedRoute, getUserProfiles);
// router.get("/user-profiles-city", protectedRoute, getCityFromCoordinates);

export default router;