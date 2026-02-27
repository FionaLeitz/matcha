import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Link } from 'react-router-dom';
import { Flame, User, LogOut, Menu, Search, Bell } from 'lucide-react';
import SearchBar from './SearchBar.jsx';

const Header = () => {
	const { authUser, logout, isVerified, isAuthentified } = useAuthStore();
	const { markNotificationIdAsSeen, getNotifications } = useNotificationStore();
	const notifications = useNotificationStore((state) => state.notifications);
	const not_seen = useNotificationStore((state) => state.not_seen);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const dropdownRef = useRef(null);
	const notificationRef = useRef(null);
	const [notificationOpen, setNotificationOpen] = useState(false);

	useEffect(() => {
		if (authUser && authUser.is_verified)
			getNotifications();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				setNotificationOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleStopNotification = async (notification_id) => {
		await markNotificationIdAsSeen(notification_id);
		await getNotifications();
	}

	return (
	<header className='bg-[#DFECCF]'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center py-4 space-x-8'>
					<div className='flex items-center space-x-8'>
						<Link to={isVerified ? "/" : "/auth"} className='flex items-center space-x-2 '>
							<div className='w-7 h-9'>
								<img src="/matchalogo3.svg"/>
							</div>
							<span className='font-matcha text-3xl font-bold text-[#344c39] hidden sm:inline'>Matcha</span>
						</Link>
					</div>
					{isVerified ? (
						<>
                    		<SearchBar />
							<div className='relative mr-1' ref={notificationRef}>
								<button
									onClick={() => setNotificationOpen(!notificationOpen)}
									className='flex items-center space-x-2 focus:outline-none'	
								>
									{not_seen != 0 ?
										<span
											className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold 
													rounded-full w-4 h-4 flex items-center justify-center"
										>
											{not_seen}
										</span>
										:
										<></>
									}
									<Bell className='w-8 h-8 text-[#344c39]'/>
									{notificationOpen && (
										<div
											ref={notificationRef}
											className={`absolute max-h-[50vh] ${notifications && notifications.length > 0 ? "min-h-[150px]" : ""}
														overflow-y-auto top-10 right-0 w-80 bg-white shadow-lg border
														border-[#344c39] rounded-lg p-4 z-50`}	
										>
											<h3 className="font-semibold text-xl text-gray-900 mb-4">Notifications</h3>
											<div className='space-y-4'>
												{notifications && notifications.length > 0 ? (
													notifications.map((notification) => (
														<Link
															to={notification.type === "message" ? `/chat/${notification.sender_id}` : `/profile/${notification.sender_username}`}
															key={notification.id}
															onMouseLeave={() => handleStopNotification(notification.id)}
															onClick={() => handleStopNotification(notification.id)}
														>
															<div
																className={`flex items-center gap-4 p-3
																			${notification.seen != false
																				? "bg-gradient-to-r from-white to-green-50"
																				: "bg-[#8ba888]"
																			} rounded-md shadow-sm hover:shadow-md transition-shadow my-2`}
																>
																<img
																	src={notification.sender_image || "/avatar.webp"}
																	alt={notification.sender_username}
																	className="w-12 h-12 rounded-full object-cover pointer-events-none"
																/>
																<div>
																	<p className='text-gray-800 font-medium text-sm'>
																		{notification.type === 'like' &&																			
																			`${notification.sender_username} liked your profile!`
																		}
																		{notification.type === 'message' &&
																			`${notification.sender_username} sent you a message`
																		}
																		{notification.type === 'match' &&
																			`You have a match with ${notification.sender_username}!`
																		}
																		{notification.type === 'unmatch' &&
																			`${notification.sender_username} unliked you and broke your match...`
																		}
																		{notification.type === 'view' &&
																			`${notification.sender_username} looked at your profile`
																		}
																	</p>
																</div>
															</div>
														</Link>
													))
												) : (
													<p className="text-gray-500 text-sm">No notification yet.</p>
												)}
											</div>
										</div>
									)}
								</button>
							</div>
						</>
						) : <></>
					}
					<div className='hidden md:flex items-center space-x-4 '>
						
					{/* {isAuthentified ? ( */}
						{authUser ? (
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className='flex items-center space-x-2 focus:outline-none'
								>
									<img 
										src={authUser.image || "/avatar.webp"}
										className='h-10 w-10 object-cover rounded-full border-2 border-[#4e7156]'
										alt="User image"
									/>
									<span className='text-[#344c39] font-medium'>
										{authUser.username}
									</span>
								</button>
								{dropdownOpen && (
									<div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10'>
										<Link
											to='/myProfile'
											className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
											onClick={() => setDropdownOpen(false)}
										>
											<User className='mr-2' size={16} />
											Profile
										</Link>
										<button
											onClick={logout}
											className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
										>
											<LogOut className='mr-2' size={16} />
											Logout
										</button>
									</div>
								)}
							</div>
						) : (
							<></>
						)}
					</div>
					<div className='md:hidden'>
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className='text-[#344c39] focus:otline-none'
						>
							<Menu className='size-6' />
						</button>
					</div>

				</div>
			</div>

			{/* MOBILE MENU */}
			{mobileMenuOpen && (
				<div className='md:hidden bg-[#8ba888]'>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
						{authUser ? (
							<>
								<Link
									to='/myProfile'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#789175]'
									onClick={() => setMobileMenuOpen(false)}
								>
									Profile
								</Link>
								<button
									onClick={() => {
										logout();
										setMobileMenuOpen(false);
									}}
									className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#789175]'
								>
									Logout
								</button>
							</>
						) : (
							<>
								<button
									onClick={logout}
									className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#789175] items-center'
								>
									<LogOut className='mr-2' size={16} />
									Logout
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	)
}

export default Header;