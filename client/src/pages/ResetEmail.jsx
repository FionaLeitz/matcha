import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import toast from "react-hot-toast";

const ResetEmail = () => {
	const { callChangeEmail, changeEmailResponse, changeEmailStatus } = useUserStore();
	const { token } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		callChangeEmail(token);
	}, []);

	useEffect(() => {
		if (changeEmailResponse != '') {
			if(changeEmailStatus === 200)
				toast.success(changeEmailResponse);
			else
				toast.error(changeEmailResponse);
			navigate("/myprofile");
		}
	}, [changeEmailResponse]);

	return (
		<div className='flex flex-col lg:flex-row min-h-screen bg-gradient-to-br
					from-green-100 to-purple-100 overflow-hidden'>
			<div className='flex-grow flex flex-col overflow-hidden'>
				<Header />
				<div className='flex flex-col items-center justify-center h-full text-center p-8'>
					<h2 className='text-3xl font-bold text-gray-800 mb-10'>wait for email change !!!!</h2>
					<p className='text-x1 text-gray-600 mb-2'>{changeEmailResponse}</p>
				</div>
			</div>
		</div>
	)
};

export default ResetEmail