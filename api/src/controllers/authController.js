import { updateUserEmail, findUserByEmailChangeToken , createUser, findUser, findUserByUsername,
	findUserById, findUserByToken, updateUserVerification, updateUserResetTokens, updateUserPasswordAndResetTokens } from '../models/dbQueries.js'
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import { passwordStrength } from 'check-password-strength'
import { transporter, mailOptions, sendEmail } from '../config/email.js';

const signToken = (id) => {
	return jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

export const sanitize = async(regex, sizeMax, input) => {
	if (Array.isArray(input)){
		for (let i = 0; i < input.length; i++) {
			if (!input[i].match(regex)) {
				const err = new Error("Sanitize error");
				err.response = { data: { message: "sanitize error: forbidden char" } };
				throw err;
			}
			if (input[i].length > sizeMax) {
				const err = new Error("Sanitize error");
				err.response = { data: { message: "sanitize error: lenght" } };
				throw err;
			}
		}
	}
	else {
		if (!input.match(regex)){
			const err = new Error("Sanitize error");
			err.response = { data: { message: "sanitize error: forbidden char" } };
			throw err;
		}
		if (input.length > sizeMax) {
			const err = new Error("Sanitize error");
			err.response = { data: { message: "sanitize error: lenght" } };
			throw err;
		}
	}

	return { success: true }
};


/* --- EMAIL VERIFICATION --- */

const generateVerificationToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_CONFIRM_SECRET, { expiresIn: "900s" });
};

export const sendVerificationEmail = async (user) => {
	if (!user)
		throw new Error("Impossible to send verification email: user is undefined.");
	const token = generateVerificationToken(user.id);
	const verificationUrl = `${process.env.CLIENT_URL}/verif?token=${token}`;
  
	const html = `
		<h1>${user.first_name}, welcome to Matcha!</h1>
		<p>Thank you fr signing up. Please click on the link below to verify your email address:</p>
		<a href="${verificationUrl}">Verify my email</a>
		<p>Note: this link is valid for 15 minutes.</p>
	`;
  
	try {
		await sendEmail(user.email, "Verification email", html);
	} catch (error) {
		throw new Error("Impossible to send verification email.");
	}
};

export const resendVerificationEmail = async(req, res) => {
	try {
		await sendVerificationEmail(req.user);
		res.status(200).json({
			success: true,
			message: "An email has been send"
		});
	} catch(error) {
		res.status(400).json({
			success: false,
			message: "Couldn't resend email"
		});
	}
}

  /* ------------------------ */

export const calculate_age = (birthday) => {
    const today = new Date();
	// difference between day number of birthday and day number of today
	const day = today.getDate() - birthday.getDate();
	// difference between month number of birthday and month number of today
    let month = today.getMonth() - birthday.getMonth();
	// difference between year of birthday and year of today
    let age = today.getFullYear() - birthday.getFullYear();
	if (day < 0)
		month -= 1;
    if (month < 0)
        age -= 1;
	return age;
}

export const signup = async (req, res) => {
	const { first_name, last_name, username, email, password, birthday, gender } = req.body
	try {
		if (!first_name || !last_name || !username || !email || !password || !birthday || !gender) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// sanitize fields
		await sanitize('^[0-9a-zA-Z-_]+$', 42, [username, last_name, first_name]);
		await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, [password, email]);

		// Check if age is under 18
        const new_birthday = new Date(birthday);
		const age = calculate_age(new_birthday);
		if (age < 18) {
			return res.status(400).json({
				success: false,
				message: "You must be at least 18 years old",
			});
		}

		// Check if password is more than 6 characters, but not necessary anymore with password strenght
		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters",
			});
		}

        /// password strenght checker ///
        if (passwordStrength(password).value != 'Strong') {
			return res.status(403).json({
				success: false,
				message: passwordStrength(password).value,
			});
		}
        // console.log(passwordStrength('asdfasdf').value)
        // // Too weak (It will return Too weak if the value doesn't match the Weak conditions)
        // console.log(passwordStrength('asdf1234').value)
        // // Weak
        // console.log(passwordStrength('Asd1234!').value)
        // // Medium
        // console.log(passwordStrength('A@2asdF2020!!*').value)
        // // Strong
        /// ----------------------- ///
		
		// Crypt password
        const crypted_password = await bcrypt.hash(password, 10);
		// Create user in database
		const newUser = await createUser(first_name, last_name, username, email, crypted_password, new_birthday, gender);

		await sendVerificationEmail(newUser);

		const token = signToken(newUser.id);

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000,	// 7 days in milliseconds
			httpOnly: true,						// prevents XSS attacks
			SameSite: "strict",					// prevents CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		res.status(201).json({
			success: true,
			user: newUser,
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

 
export const login = async (req, res) => {
	const { username, password } = req.body
	try {
		if (!username || !password) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		await sanitize('^[0-9a-zA-Z-_]+$', 42, [username]);
		await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, password);

        const user = await findUserByUsername(username);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid username or password",
			});
		}

        if (!(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid username or password",
			});
        }

		const token = signToken(user.id);

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000,	// 7 days in milliseconds
			httpOnly: true,						// prevents XSS attacks
			sameSite: "strict",					// prevents CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		//check for email verif
		if (user.is_verified) {
			const accessToken = jwt.sign({id: user.id}, process.env.JWT_VERIF_SECRET, {
				expiresIn: '24h'
			});
			res.cookie("access", accessToken, {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
			});
		}

		res.status(200).json({
			success: true,
			user,
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

export const logout = async (req, res) => {
	res.clearCookie("jwt");
	res.clearCookie("access");
	res.status(200).json({
		success: true,
		message: "Logged out successfully!"
	});
};

export const check_auth = async (req, res) => {
	const authToken = req.cookies.jwt;
	const verifToken = req.cookies.access;
	let isAuthentified = false;
	let isVerified = false;
	let user = null;

	try {
		if (!authToken) {
			res.status(200).json({
				success: true,
				isAuthentified,
				isVerified,
				user
			});
		}
		else {
			const authDecoded = jwt.verify(authToken, process.env.JWT_SECRET);
			const authUserId = authDecoded.id;
	
			const authUser = await findUserById(authUserId);
			if (authUser) {
				isAuthentified = true;
				user = authUser;
			}
			if (!verifToken)
				isVerified = false;
			else {
				const verifiedDecoded = jwt.verify(verifToken, process.env.JWT_VERIF_SECRET);
				const verifiedUserId = verifiedDecoded.id;
	
				const verifiedUser = await findUserById(verifiedUserId);
				if (verifiedUser) {
					isVerified = true;
					user = verifiedUser;
				}
			}
			res.status(200).json({
				success: true,
				isAuthentified,
				isVerified,
				user
			});
		}
	} catch (error) {
		res.status(400).json({ success: false, message: "Error in check_auth" });
	};
};

export const verifyEmail = async (req, res) => {
	const { token } = req.query;
	try {
		const decoded = jwt.verify(token, process.env.JWT_CONFIRM_SECRET);
	  	const userId = decoded.id;

		const user = await findUserById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "Unknown user." });
		}
	
		if (user.is_verified) {
			return res.status(400).json({ success: false, message: "Email already verified." });
		}
	
		await updateUserVerification(user.id, true);

		const accessToken = jwt.sign({id: user.id}, process.env.JWT_VERIF_SECRET, {
			expiresIn: '24h'
		});

		res.cookie("access", accessToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000,	// 7 days in milliseconds
			httpOnly: true,						// prevents XSS attacks
			sameSite: "strict",					// prevents CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		res.status(200).json({ success: true, message: "Email verified." });
	} catch (error) {
		res.status(400).json({ success: false, message: "Verification link is invalid or expired." });
	}
}

export const requestFortgotPassword = async (req, res) => {
    const { email } = req.body;

	try {
		await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, email);
		const user = await findUser(email);
		if (user) {
			// generate a token
			const resetToken = crypto.randomBytes(32).toString('hex');
			// hash it and store it + exp date into the db
			const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
			const exp = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes

			await updateUserResetTokens(user.id, hashedToken, exp);

			const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
		
			const html = `
				<h1>MATCHA - Reset Password</h1>
				<p>A request has been made to reset the password for your account. If you initiated this request, please use the link below to reset your password.</p>
				<a href="${resetURL}">Reset password</a>
				<p>Note: this link is valid for 10 minutes.</p>
				`
			try {
				await sendEmail(user.email, "Password reset request", html);	
			} catch (error) {
				throw new Error("Cannot send verification email.");
			}
		}
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
		
	res.status(200).json({ message: 'If an account with this email exists, a password reset email has been sent.' });
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		if (!token) {
			return res.status(400).json({ message: "No token provided." });
		}

		if (!password) {
			return res.status(400).json({ message: "Password is required." });
		}

		await sanitize('^[0-9a-zA-Z-_!?,.$#^&*=+:;~@]+$', 255, password);

		// check if token exists and is not expired
		const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
		const user = await findUserByToken(hashedToken);

		if (!user) {
			return res.status(400).json({ message: 'Token is invalid or has expired.' });
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters",
			});
		}

        /// password strenght checker ///
        if (passwordStrength(password).value != 'Strong') {
			return res.status(403).json({
				success: false,
				message: passwordStrength(password).value,
			});
		}

		// update password and revoke tokens
		const newPassword = await bcrypt.hash(password, 10);

		await updateUserPasswordAndResetTokens(user.id, newPassword, null, null);

		res.status(200).json({ message: 'Password successfully updated.' });
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




