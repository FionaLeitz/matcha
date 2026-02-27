import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { login, loading } = useAuthStore();

	const handleSubmit = async(e) => {
		try {
			e.preventDefault();
			const ret = await login({ username, password });
			if (ret === true) {
				// const timeout = setTimeout(() => {
					navigate("/");
				// }, 2000);
		  
				// return () => clearTimeout(timeout);
			}
		} catch(error) {}
	}

	return (
		<>
			<form
				className='space-y-6 '
				onSubmit={handleSubmit}
			>
				{/* USERNAME */}
				<div>
					<label htmlFor='username' className='block text-sm font-medium text-gray-800'>
						Username
					</label>
					<div className='mt-1'>
						<input
							id='username'
							name='username'
							type='username'
							autoComplete='username'
							required
							value={username}
							maxLength="42"
							onChange={(e) => setUsername(e.target.value)}
							className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
						/>
					</div>
				</div>
				{/* PASSWORD */}
				<div>
					<label htmlFor='password' className='block text-sm font-medium text-gray-800'>
						Password
					</label>
					<div className='mt-1'>
						<input
							id='password'
							name='password'
							type='password'
							autoComplete='current-password'
							required
							value={password}
							maxLength="255"
							onChange={(e) => setPassword(e.target.value)}
							className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
						/>
					</div>
				</div>
				<button 
					type='submit'
					className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#f5f3ee] ${
						loading
							? "bg-[#344c39] cursor-not-allowed"
							: "bg-[#4b774e] hover:bg-[#344c39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ba888]"
					}`}
					disabled={loading}
				>
					{loading ? "Signing in..." : "Sign in"}
				</button>
			</form>
			<div className='w-full flex justify-center pt-4'>
				<Link
					className='flex justify-center text-sm text-gray-700 hover:text-[#789175]'
					to={`/forgot-password`}
				>
					Forgot your password?
				</Link>
			</div>
		</>
	)
}

export default LoginForm