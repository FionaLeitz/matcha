import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
	const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState(new Date());
	const { signup, loading, checker } = useAuthStore()
	const navigate = useNavigate();
	
	const handleSubmit = async(e) => {
		try {
			e.preventDefault();
			const ret = await signup({ first_name, last_name, username, email, password, gender, birthday });
			if (ret === true) {
				const timeout = setTimeout(() => {
					navigate("/myProfile");
					// locateMe();
				}, 1000);
		  
				return () => clearTimeout(timeout);
			}
		} catch(error) {}
	}

	return (
		<form
			className='space-y-6'
			onSubmit={handleSubmit}
		>
			{/* FIRST NAME */}
			<div>
				<label htmlFor='first_name' className='block text-sm font-medium text-gray-700'>
					First name
				</label>
				<div className='mt-1'>
					<input
						id='first_name'
						name='first_name'
						type='text'
						required
						value={first_name}
						maxLength="42"
						onChange={(e) => setFirstName(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
					/>
				</div>
			</div>

            {/* LAST NAME */}
			<div>
				<label htmlFor='last_name' className='block text-sm font-medium text-gray-700'>
					Last name
				</label>
				<div className='mt-1'>
					<input
						id='last_name'
						name='last_name'
						type='text'
						required
						value={last_name}
						maxLength="42"
						onChange={(e) => setLastName(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
					/>
				</div>
			</div>

            {/* USERNAME */}
			<div>
				<label htmlFor='username' className='block text-sm font-medium text-gray-700'>
					Username
				</label>
				<div className='mt-1'>
					<input
						id='username'
						name='username'
						type='text'
						required
						value={username}
						maxLength="42"
						onChange={(e) => setUsername(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
					/>
				</div>
			</div>

			{/* EMAIL */}
			<div>
				<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
					Email address
				</label>
				<div className='mt-1'>
					<input
						id='email'
						name='email'
						type='email'
						autoComplete='email'
						required
						value={email}
						maxLength="255"
						onChange={(e) => setEmail(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
					/>
				</div>
			</div>

			{/* PASSWORD */}
			<div>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						id='password'
						name='password'
						type='password'
						autoComplete='new-password'
						required
						value={password}
						maxLength="255"
						onChange={(e) => setPassword(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-[#789175a8] rounded-md shadow-sm
										bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
					/>
                    {checker}
				</div>
			</div>

			{/* BIRTHDAY */}
			<div>
				<label htmlFor='birthday' className='block text-sm font-medium text-gray-700'>
                    Birthday
				</label>
				<div className='mt-1'>
                    {/* date picker with easy year selection */}
                    <DatePicker
						id='birthday'
                        selected={birthday}
                        onChange={(date) => setBirthday(date)}
                        placeholderText="Select your birthdate"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
						maxDate={new Date()}
                        required
						className='border pl-1 border-[#789175a8] shadow-sm
						bg-[#f0f0da] text-gray-800 focus:outline-none focus:ring-[#789175] focus:border-[#789175] sm:text-sm'
                    />
				</div>
			</div>

			{/* GENDER */}
			<div>
				<label className='block text-sm font-medium text-gray-700'>Your Gender</label>
				<div className='mt-2 flex gap-2'>
					<div className='flex items-center'>
						<input
							id='male'
							name='gender'
							type='checkbox'
							checked={gender === "male"}
							onChange={() => setGender("male")}
							className='h-3 w-3 bg-[#f0f0da] text-gray-100 border-gray-300 rounded'
						/>
						<label htmlFor='male' className='ml-2 block text-sm text-gray-900'>
							Male
						</label>
					</div>
					<div className='flex items-center'>
						<input
							id='female'
							name='gender'
							type='checkbox'
							checked={gender === "female"}
							onChange={() => setGender("female")}
							className='h-3 w-3 bg-violet-50 border-gray-300 rounded'
						/>
						<label htmlFor='female' className='ml-2 block text-sm text-gray-800'>
							Female
						</label>
					</div>
				</div>
			</div>
			<div>
				<button
					type='submit'
					className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm
						font-medium text-white ${
							loading
							? "bg-[#344c39] cursor-not-allowed"
							: "bg-[#4b774e] hover:bg-[#344c39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ba888]"
					}`}
					disabled={loading}
				>
					{loading ? "Signing up..." : "Sign up"}
				</button>
			</div>
		</form>
	);
};

export default SignUpForm