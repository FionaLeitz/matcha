import React from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore'
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react'

const ListView = () => {
	const userProfiles = useMatchStore((state) => state.sortedUserProfiles);
	const authUser = useAuthStore((state) => state.authUser);
	const { checkAuth } = useAuthStore();
	const { unlike, like } = useMatchStore();
	
	const handleUnlike = async (userProfile) => {
		await unlike(userProfile);
		await checkAuth();
	};

	const handleLike = async (userProfile) => {
		await like(userProfile);
		await checkAuth();
	};

	return (
		<div className='flex-grow flex flex-col max-h-[76vh] overflow-hidden'>
			<div className="p-4 overflow-auto max-h-[80vh] mt-2">
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-5xl'>
					{userProfiles.map((user) => (
						<div
							className="shadow-none"
							key={user.id}
						>
							<Link
								to={`/profile/${user.username}`}
								className='card bg-white w-full max-w-[20rem] h-[35rem] select-none rounded-lg overflow-hidden border
								border-gray-200'
							>
								<figure className='h-[55%] w-full'>
									{authUser.username != user.username &&
										<>
											<div
												title={!(authUser.image) ? "You need a profile picture to like other profiles" : ""}
											>
												<Heart
													className={`absolute top-2 left-2 text-[#44624a]
																z-10 hover:fill-[#44624a] ${authUser.likes.includes(user.id) ? 'fill-current' : ''}`}
													onClick={(event) => {
														if (!(authUser.image)) {
															event.preventDefault();
															event.stopPropagation();
															return ;
														}
														event.preventDefault();
														event.stopPropagation();
														authUser.likes.includes(user.id)
															? handleUnlike(user)
															: handleLike(user);
													}}
												/>
											</div>
											<div
												className={`absolute top-2 right-2 h-2 w-2 z-10 rounded-lg
															${user.is_connected ? 'bg-green-600' : 'bg-red-600'} `}
												title={user.is_connected ? "online" : "offline"}
											/>
										</>
									}
									<LazyLoadImage
										src={user.image || "avatar.webp"}
										alt={user.username}
										className='w-full h-full object-cover pointer-events-none'
									/>
								</figure>
								<div className='card-body flex flex-col bg-gradient-to-b from-white to-green-50 p-3'>
									<div className='flex items-center justify-between'>
										<h2 className='text-xl font-semibold text-gray-800 truncate w-3/4'>
											{user.username}
										</h2>
										<span className='text-lg text-gray-600'>{user.age}</span>
									</div>
									<h3 className='text-md text-gray-700'>{user.first_name} {user.last_name}</h3>
									<div className="flex items-center text-sm text-gray-700">
										<MapPin className='w-4' />
										<p className='text-sm px-1'>{user.city} ({user.loc?.components?.postcode})</p>
										{user.distance ?
											<p className='text-sm px-1'> {user.distance.toFixed(0)}km away from you</p>
										:
											<></>
										}
									</div>
									<div className="my-3 border-t border-gray-200"/>
									<p className='text-xs leading-tight'>Fame: {user.likes.length > 0
										? `${((user.match_nbr / user.likes.length) * 100).toFixed(0)}%`
										: "0%"}</p>
									<p className="text-gray-600 max-h-[3.1rem] break-all overflow-hidden leading-tight">
										{user.bio}
									</p>
									<div className='flex flex-wrap gap-2 overflow-hidden max-h-[3rem]'>
										{user.tags && user.tags.map((tag, index) => (
											<span
												key={index}
												className='bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md'
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default ListView