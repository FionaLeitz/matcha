import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams } from 'react-router-dom';
import Geolocation from 'react-native-geolocation-service';
import { useUserStore } from '../store/useUserStore';
import { Link, useNavigate } from 'react-router-dom';

const VerifPage = () => {
	const { callVerif, verifResponse } = useAuthStore();
	const isVerified = useAuthStore((state) => state.isVerified)
	const [searchParams] = useSearchParams();
	const {updateLocation} = useUserStore();
	const navigate = useNavigate();
	const authUser = useAuthStore((state) => state.authUser);

	useEffect(() => {
		const query = searchParams.get("token") || "";
		callVerif(query);
		updateLocation(null, null);
	}, []);

	// go to myProfile after 5 seconds
	useEffect(() => {
		if (isVerified) {
			const timeout = setTimeout(() => {
				navigate("/myProfile");
				// locateMe();
			}, 5000);
	  
			return () => clearTimeout(timeout);
		}
	}, [isVerified]);

	return (
		<div className='min-h-screen flex flex-col bg-[#fdfdd0]'>
		<Header />
			<div className='flex-grow flex justify-center items-center p-4'>
				<div className='w-full max-w-md'>
					{verifResponse === "Email verified." ? (
						<>
							<h2 className='text-center text-4xl font-playfair font-semibold text-[#344c39] mb-10'>
							<span>{authUser.first_name}, welcome to </span> <span className='text-[42px] font-matcha'>Matcha.</span>
							</h2>
							<h2 className='text-center text-2xl font-bold text-[#4e7256] mb-8'>
								Are you ready to find love with Matcha?
							</h2>
					</>
					) : (
						<>
						<h2 className='text-center text-2xl font-bold text-[#4e7256] mb-8'>
								{verifResponse}
						</h2>
						</>
					)}
					<p className='text-x1 text-center justify-center text-gray-800 mb-2'>
						Please complete you profile to let other users know you better. Know that you can't like other users if you don't have a profile picture.
					</p>
					<Link
						to='/myProfile'
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base
						font-medium text-white bg-[#4b774e] hover:bg-[#344c39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ba888]"
						type="button"
					>
						Complete my profile
					</Link>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default VerifPage
