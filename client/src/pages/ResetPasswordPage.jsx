import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import toast from "react-hot-toast";
import Footer from '../components/Footer';

const ResetPasswordPage = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const { callResetPassword, resetPasswordResponse, checker } = useAuthStore();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!token) {
			setError("Missing or invalid token");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!newPassword || !confirmPassword) {
			setError("All fields required");
			return;
		}
	
		if (newPassword !== confirmPassword) {
			setError("Passwords don't match.");
			return;
		}
	
		setIsSubmitting(true);
		setError("");
	
		try {
			const ret = await callResetPassword(token, newPassword);
			if(ret)
				navigate("/auth");
		} catch (err) {
			setError("An error occured : " + err.message);
			toast.error(err);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className='min-h-screen flex flex-col bg-[#344c39]'>
		 	<Header />
			<div className='flex-grow flex justify-center items-center p-4'>
				<div className='w-full max-w-md'>
					<h2 className='text-center text-3xl font-extrabold text-[#fdfdd0] mb-10'>Reset your password</h2>
					<h2 className='text-center text-2xl font-bold text-[#fdfdd0] mb-8'>
						Enter the new password you want.
					</h2>
					{error && <div className="text-red-500 text-sm mb-4">{error}</div>}
					<pre className='text-xs mb-2 text-red-500'>
						{checker}
					</pre>
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label htmlFor="newPassword" className="block text-sm text-gray-300 font-medium mb-1">
								New password
							</label>
							<input
								id="newPassword"
								type="password"
								value={newPassword}
								maxLength="255"
								onChange={(e) => setNewPassword(e.target.value)}
								required
								placeholder="Enter new password"
								className="appearance-none block w-full px-3 py-2 border-2 border-gray-300
											rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-[#18241b]
											focus:border-[#18241b] sm:text-sm"
							/>
							
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								maxLength="255"
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								placeholder="Confirm new password"
								className="appearance-none block w-full px-3 py-2 mt-2 border-2 border-gray-300
											rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-[#18241b]
											focus:border-[#18241b] sm:text-sm"
							/>
						</div>
						<pre className='text-xs mb-9'>
						{`Password must be at least 8 characters and contain:\n1 lowercase alphabetical character\n1 uppercase alphabetical character\n1 numeric character\n1 special character`}
						</pre>
						<button
							type="submit"
							className={`w-full bg-[#8ba888] text-[#f5f3ee] py-2 rounded ${isSubmitting ? "opacity-50" : ""}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Change password"}
						</button>
					</form>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default ResetPasswordPage;
