import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { popularTags, similarTags, addTag, assignTagToUser, userTags, removeTagFromUser } from "../controllers/tagController.js";

const router = express.Router();

router.post("/create", protectedRoute, addTag)
router.post("/assign", protectedRoute, assignTagToUser)
router.get("/popular", protectedRoute, popularTags)
router.get("/similar/:tag_name", protectedRoute, similarTags)
router.post("/remove", protectedRoute, removeTagFromUser);
router.get("/user/:user_id", protectedRoute, userTags);

export default router;