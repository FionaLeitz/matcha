import React, { useState } from 'react';
import { useEffect } from 'react'
import TinderCard from 'react-tinder-card';
import { useMatchStore } from '../store/useMatchStore';
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom';

const SwipeArea = () => {
	const { swipeRight, swipeLeft } = useMatchStore();
	const userProfiles = useMatchStore((state) => state.sortedUserProfiles);
	const [swipeCount, setSwipeCount] = useState(0);
	const [presentedProfiles, setPresentedProfiles] = useState([...userProfiles].slice(0, 6).reverse());

	// TODO: a bien bien retester !!
	const handleSwipe = (direction, user) => {
		if (direction === "right")
			swipeRight(user)
		else if (direction === "left")
			swipeLeft(user)

		const newSwipeCount = swipeCount + 1;
    	setSwipeCount(newSwipeCount);

		if (newSwipeCount % 5 === 0 && userProfiles.length > newSwipeCount) {
			const nextProfiles = [...userProfiles].slice(newSwipeCount + 1, newSwipeCount + 6);
        	setPresentedProfiles(prev => [...prev, ...nextProfiles].reverse());
		}
	};

	useEffect(() => {
		setPresentedProfiles([...userProfiles].slice(0, 6).reverse());
	}, [userProfiles]);

	return (
		<div className='relative w-full max-w-sm h-[40rem]'>
			{presentedProfiles.map((user) => (
				<TinderCard
					className='absolute shadow-none'
					key={user.id}
					onSwipe={(dir) => handleSwipe(dir, user)}
					swipeRequirementType='position'
					swipeThreshold={100}
					preventSwipe={["up", "down"]}
				>
					<div
						className='card bg-white w-[22rem] h-[40rem] select-none rounded-lg overflow-hidden border
						border-gray-200'
					>
						<Link
							to={`/profile/${user.username}`}
							key={user.id}
							className='absolute z-10 top-1 left-1 text-white bg-black/80 px-2 py-1 rounded-md'
						>
							Full profile
						</Link>
						<div
							className={`absolute top-2 right-2 h-2 w-2 z-10 rounded-lg
										${user.is_connected ? 'bg-green-600' : 'bg-red-600'} `}
							title={user.is_connected ? "online" : "offline"}
						/>
						<figure className='h-[55%] w-full'>
							<img
								src={user.image || "avatar.webp"}
								className='w-full h-full object-cover pointer-events-none'
							/>
						</figure>
						<div className='card-body flex flex-col bg-gradient-to-b from-white to-green-50 pt-3 pl-3'>
							<h2 className='card-title text-2xl text-gray-800 leading-3 mt-2'>
								{user.username}, {user.age}
							</h2>
							<h2 className='text-l text-gray-700'>
                           		{user.first_name} {user.last_name}
							</h2>
							<div className="flex items-center text-sm text-gray-700">
								<MapPin className='w-4' />
								<p className='text-sm px-1'>{user.city} ({user.loc?.components?.postcode})</p>
								{user.distance ?
									<p className='text-sm px-1'> {user.distance.toFixed(0)}km away from you</p>
								:
									<></>
								}
							</div>
							<div className="my-2 border-t border-gray-200"/>
							<p className='text-xs leading-tight'>Fame: {user.likes.length > 0
								? `${((user.match_nbr / user.likes.length) * 100).toFixed(0)}%`
								: "0%"}</p>
							<p className="text-gray-600 max-h-[4.5rem] break-all overflow-hidden leading-tight">
								{user.bio}
							</p>
							<div className='flex flex-wrap gap-2 overflow-hidden max-h-[3rem]'>
								{user.tags && user.tags.map((tag, index) => (
									<span
										key={index}
										className='bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-md'
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>
				</TinderCard>
			))}
		</div>
	)
}

export default SwipeArea