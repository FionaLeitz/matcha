import jwt from "jsonwebtoken";
import { findUserById } from '../models/dbQueries.js'

export const protectedRoute = async (req, res, next) => {
	try {
        
		const token = req.cookies.access;

		if (!token) {
			return res.redirect('/auth');
		}

		const decoded = jwt.verify(token, process.env.JWT_VERIF_SECRET);

		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: "Not authorized - Invalid access token"
			})
		}

		const currentUser = await findUserById(decoded.id);

		req.user = currentUser;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: "Not authorized - Invalid access token",
			});
		} else {
			return res.status(400).json({
				success: false,
				message: "Unknown server error",
			});
		}
	}
};

export const protectedConfirm = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Not authorized - No token provided"
			})
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: "Not authorized - Invalid token"
			})
		}

		const currentUser = await findUserById(decoded.id);

		req.user = currentUser;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: "Not authorized - Invalid token",
			});
		} else {
			return res.status(400).json({
				success: false,
				message: "Unknown server error",
			});
		}
	}
};