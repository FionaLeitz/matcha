import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore'
import toast from "react-hot-toast";


const ConfirmPage = () => {
	const {resendVerificationEmail} = useAuthStore();
	const resendVerifResponse = useAuthStore((state) => state.resendVerifResponse);
	const authUser = useAuthStore((state) => state.authUser);

	const resendEmail = async () => {
		const ret = await resendVerificationEmail();
		if (ret) {
			toast.success(resendVerifResponse || "An email has been send.")
		} else {
			toast.error(resendVerifResponse || "An error occured.")
		}
    };

	return (
		<div className='min-h-screen flex flex-col bg-[#344c39]'>
		 	<Header />
			<div className='flex-grow flex justify-center items-center p-4'>
				<div className='w-full max-w-md'>
					<h2 className='text-center text-4xl font-playfair font-semibold text-[#fdfdd0] mb-10'>Email verification required</h2>
					<h2 className='text-center text-xl text-[#f3f3d8] mb-16'>
						Please verify your account before accessing your profile. An email has been sent to {authUser.email}.
					</h2>
					<p className='text-x1 font-railway text-[#f3f3d8] mb-5'>If you haven't received an email, please check your spam folder or click the button below to resend the email.</p>
					<button
						onClick={() => resendEmail()}
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base
						font-medium text-white bg-[#4b774e] hover:bg-[#344c39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ba888]"
						type="button"
					>
						Send email again
					</button>
				</div>
			</div>
			<Footer />
		</div>
	)
};

export default ConfirmPage