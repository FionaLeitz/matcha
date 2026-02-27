import express from 'express';
import { signup, login, logout, verifyEmail, check_auth, requestFortgotPassword,
	resetPassword, resendVerificationEmail } from '../controllers/authController.js';
import { protectedRoute, protectedConfirm } from '../middleware/auth.js';

const router = express.Router();

router.get("/", check_auth);

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", requestFortgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/resend-verif", protectedConfirm, resendVerificationEmail);

router.get("/me", protectedRoute, (req, res) => {
	res.send({
		success: true,
		user: req.user,
	});
});

export default router;