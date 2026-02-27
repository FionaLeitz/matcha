import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';

const AskToResetPassword = () => {
	const { sendResetPasswordEmail } = useAuthStore();
	const [emailAddress, setEmailAddress] = useState("");

	const sendEmail = async () => {
		sendResetPasswordEmail(emailAddress);
	}

	return (
		<div className='min-h-screen flex flex-col bg-[#344c39]'>
		 	<Header />
			<div className='flex-grow flex justify-center items-center p-4'>
				<div className='w-full max-w-md'>
					<h2 className='text-center text-3xl font-extrabold text-[#fdfdd0] mb-10'>Reset your password</h2>
					<h2 className='text-center text-2xl font-bold text-[#fdfdd0] mb-8'>
						Enter you email address so we can send you a link to reset your password.
					</h2>
					<input
						type="text"
						value={emailAddress}
						maxLength="255"
						onChange={(e) => {
							setEmailAddress(e.target.value.toLowerCase());
						}}
						placeholder="Your email address"
						className="appearance-none block w-full px-3 py-2 border-2 border-gray-300
											rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-[#18241b]
											focus:border-[#18241b] sm:text-sm"
					/>
					<button
						onClick={() => sendEmail()}
						className="flex items-center justify-center mt-4 py-2 px-4 space-x-2 w-full bg-[#8ba888] text-[#f5f3ee] rounded"
						type="button"
					>
						Send email
					</button>
				</div>
			</div>
			<Footer />
		</div>
	)
};

export default AskToResetPassword