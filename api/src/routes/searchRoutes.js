import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { search } from '../controllers/searchController.js';

const router = express.Router();

router.get("/", protectedRoute, search);

export default router;