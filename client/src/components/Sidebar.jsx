import React, { useEffect, useState } from 'react'
import { Heart, Loader, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMatchStore } from '../store/useMatchStore';

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const toggleSidebar = () => setIsOpen(!isOpen);
	const {getMyMatches, isLoadingMyMatches} = useMatchStore();
	const matches = useMatchStore((state) => state.matches);

	useEffect(() => {
		getMyMatches()
        console.log(matches)
	}, [getMyMatches]);

	return (
		<>
			<div className={`
				fixed inset-y-0 left-0 z-10 w-64 bg-[#fdfdfad9] shadow-md overflow-hidden transition-transform duration-300
				ease-in-out
				${isOpen ? "translate-x-0" : "-translate-x-full"}
				lg:translate-x-0 lg:static lg:w-1/4
			`}>
				<div className='flex flex-col h-full'>
					{/* HEADER */}
					<div className='p-4 pb-[27px] border-b border-[#DFECCF] flex justify-between items-center'>
						<h2 className='text-xl font-bold text-[#344c39]'>Matches</h2>
						<button
							className='lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none'
							onClick={toggleSidebar}
						>
							<X size={24} />
						</button>
					</div>
					<div className='flex-grow overflow-y-auto p-4 z-10 relative'>
						{isLoadingMyMatches ? <LoadingState /> : matches.length === 0 ? <NoMatchesFound /> : (
							matches.map(match => (
								<Link key={match.id} to={`/chat/${match.id}`} >
									<div className='flex items-center mb-4 cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors duration-300'>
										<img src={match.image} alt="User avatar"
											className='size-12 object-cover rounded-full mr-3 border-2 border-[#4e7156]'
										/>
										<h3 className='font-semibold text-gray-800'>{match.username}</h3>
									</div>
								</Link>
							))
						)}
					</div>
				</div>
			</div>
			<button className='lg:hidden fixed top-4 left-4 p-2 bg-[#8ba888] hover:bg-[#789175] text-white rounded-md z-0'
				onClick={toggleSidebar}
			>
				<MessageCircle size={24} />
			</button>
		</>
	);
};

export default Sidebar;

const NoMatchesFound = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Heart className='text-[#8ba888] mb-4' size={48} />
		<h3 className='text-x1 font-semibold text-gray-700 mb-2'>No Matches Yet</h3>
		<p className='text-gray-500 max-w-xs'>
			Don't worry! Your perfect match is just around the corner. Keep swiping!
		</p>
	</div>
);

const LoadingState = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Loader className='text-[#8ba888] mb-4 animate-spin' size={48} />
		<h3 className='text-x1 font-semibold text-gray-700 mb-2'>Loading Matches</h3>
		<p className='text-gray-500 max-w-xs'>We're finding your perfect matches. This might take a moment...</p>

	</div>
);