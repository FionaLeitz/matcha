import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import Footer from '../components/Footer';

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true)

	return (
		<div className='min-h-screen flex flex-col bg-[#344c39]'>
			<div className='flex-grow flex items-center justify-center p-4'>
				<div className='w-full max-w-md '>
					<h2 className='text-center font-playfair text-3xl font-extrabold text-[#f7edd6] mb-8'>
					{isLogin ? (
						<>
							<span>Sign in to</span> <span className="font-matcha text-4xl font-semibold">Matcha</span>
						</>
						) : (
						<>
							<span>Create a</span> <span className="font-matcha text-4xl font-semibold">Matcha</span> <span>account</span>
						</>
						)}

					</h2>
					<div className=' shadow-xl rounded-lg p-8 bg-[#DFECCF]'>
						{isLogin ? <LoginForm /> : <SignUpForm />}
						<div className='mt-8 text-center'>
							<p className='text-sm text-gray-800'>
								{isLogin ? "New to Matcha?" : "Already have an account?"}
							</p>

							<button
								onClick={() => setIsLogin((prevIsLogin) => !prevIsLogin)}
								className='mt-2 text-[#3a5540] hover:text-[#2a3d2e] font-semibold transition-colors duration-300'
							>
								{isLogin ? "Create new account" : "Sign in to your account"}
							</button>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}

export default AuthPage