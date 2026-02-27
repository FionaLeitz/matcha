import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer';
import { useProfileStore } from '../store/useProfileStore'
import { useAuthStore } from '../store/useAuthStore'
import { useMatchStore } from '../store/useMatchStore'
import { useUserStore } from '../store/useUserStore'
import { Flag, Lock, LockOpen, Heart, HeartOff, Loader, MessageCircle, MapPin } from 'lucide-react'
import { useParams, Link } from 'react-router-dom';
import Modal from "react-modal";

Modal.setAppElement('#root');

const ProfilePage = () => {
    const { loading, isOnline, userProfile, getUserProfile, addViews, getUserOnlineStatus } = useProfileStore();
    const { authUser, checkAuth } = useAuthStore();
	const { block, unblock, matches, getMyMatches, unlike, like, isChangingStatus } = useMatchStore();
	const { reportUserAsFake, likes, getProfileLikes } = useUserStore();
	const { username } = useParams();
    const [selectedImage, setSelectedImage] = useState(null);
	const [status, setStatus] = useState(null);

	useEffect(() => {
		getMyMatches();
		if (userProfile) {
			getUserOnlineStatus(userProfile.id);
			if (authUser.blocked.includes(userProfile.id))
				setStatus("blocked")
			else if (matches.some(user => user.username === userProfile.username))
				setStatus("match")
			else if (authUser.likes.includes(userProfile.id))
				setStatus("like")
			else
 				setStatus("none")
		}
	}, [userProfile, authUser]);

    useEffect(() => {
		getUserProfile(username);
		getProfileLikes();
		if (userProfile && authUser.username != username)
			addViews(username);
	}, []);

	const openImageModal = (image) => {
        setSelectedImage(image);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

	const handleUnlike = async () => {
		await unlike(userProfile);
		await getUserProfile(username);
		await checkAuth();
	};

	const handleLike = async () => {
		await like(userProfile);
		await getUserProfile(username);
		await checkAuth();
	};

	const handleBlock = async () => {
		await block(userProfile);
		await checkAuth();
	}

	const handleUnblock = async () => {
		await unblock(userProfile);
		await checkAuth();
	}

	const handleReport = async () => {
		await reportUserAsFake(userProfile);
		await getUserProfile(username);
	}

    return (
        <div className='min-h-screen bg-[#F0F5EA] flex flex-col'>
			<Header />
			{userProfile && userProfile.username != authUser.username && (
				<div className="flex flex-col items-center px-4 py-6 sm:px-6 lg:px-8 space-y-4">
					<div className="w-full max-w-2xl space-y-4 bg-[#fdfdfad9] shadow-md rounded-lg p-6 flex flex-col items-center">
						<div className="flex flex-row space-x-14 px-6 sm:px-8 w-full max-w-4xl">
							{/* REPORT */}
							<div className="flex-1">
								{userProfile.reported_by.includes(authUser.id) ? (
									<div className="flex items-center space-x-2 text-red-600 font-medium">
										<Flag className="w-5 h-5" />
										<span>You reported {userProfile.username} as a fake account</span>
									</div>
								) : (
									<button
										className="flex items-center justify-center py-2 px-4 space-x-2 w-full border border-transparent
													rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700
													focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
										type="button"
										onClick={handleReport}
									>
										<Flag className="w-5 h-5" />
										<span>Report as a fake account</span>
									</button>
								)}
							</div>
							{/* BLOCK */}
							<div className="flex-1">
								{authUser.blocked.includes(userProfile.id) ? (
									<button
										className="flex items-center justify-center py-2 px-4 space-x-2 w-full border border-transparent
													rounded-md shadow-sm font-medium text-white bg-gray-600 hover:bg-gray-700
													focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
										type="button"
										onClick={handleUnblock}
									>
										<LockOpen className="w-5 h-5" />
										<span>Unblock</span>
									</button>
								) : (
									<button
										className="flex items-center justify-center py-2 px-4 space-x-2 w-full border border-transparent
													rounded-md shadow-sm font-medium text-white bg-gray-600 hover:bg-gray-700
													focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
										type="button"
										onClick={handleBlock}
									>
										<Lock className="w-5 h-5" />
										<span>Block</span>
									</button>
								)}
							</div>
						</div>
						{/* LIKE / UNLIKE / CHAT */}
						<div className="w-full flex flex-col items-center space-y-4">
							{status && status === "match" ? (
								<>
									<h2 className="text-xl font-semibold text-gray-800">
										You matched with {userProfile.username}!
									</h2>
									<div className="flex items-center space-x-4">
										<button
											type="button"
											className="flex items-center py-2 px-4 space-x-2 border border-transparent rounded-md shadow-sm
														font-medium text-white bg-[#8ba888] hover:bg-[#789175] focus:outline-none
														focus:ring-2 focus:ring-offset-2 focus:ring-[#8ba888]"
											onClick={handleUnlike}
											disabled={isChangingStatus}
										>
											<HeartOff className="w-5 h-5" />
											<span>{isChangingStatus ? "Saving" : "Unmatch and unlike"}</span>
										</button>
										<Link
											to={`/chat/${userProfile.id}`}
											className="flex items-center py-2 px-4 space-x-2 border border-[#8ba888] rounded-md shadow-sm
														bg-white hover:bg-[#DFECCF]"
										>
											<MessageCircle className="w-5 h-5 text-[#8ba888]" />
											<span>Chat</span>
										</Link>
									</div>
								</>
							) : status === "like" ? (
								<div className="flex items-center space-x-4">
									<h2 className="text-xl font-semibold text-gray-800">
										You liked {userProfile.username}'s profile.
									</h2>
									<button
										type="button"
										className="flex items-center py-2 px-4 space-x-2 border border-transparent rounded-md shadow-sm
													font-medium text-white bg-[#8ba888] hover:bg-[#789175] focus:outline-none focus:ring-2
													focus:ring-offset-2 focus:ring-[#8ba888]"
										onClick={handleUnlike}
										disabled={isChangingStatus}
									>
										<HeartOff className="w-5 h-5" />
										<span>{isChangingStatus ? "Saving" : "Unlike"}</span>
									</button>
								</div>
							) : status === "none" ? (
								<div className="flex flex-col items-center space-y-2">
									<h2 className="text-xl font-semibold text-gray-800">
										You have no relation with {userProfile.username}...
									</h2>
									{likes.some((like) => like.id === userProfile.id) && (
										<h2 className="text-xl font-semibold text-gray-800">
											But they like you!
										</h2>
									)}
									<button
										type="button"
										className="flex items-center py-2 px-4 space-x-2 border border-transparent rounded-md shadow-sm font-medium
													text-white bg-[#8ba888] hover:bg-[#789175] focus:outline-none focus:ring-2 focus:ring-offset-2
													focus:ring-[#8ba888]"
										onClick={handleLike}
										disabled={isChangingStatus || !(authUser.image)}
										title={!(authUser.image) ? "You need a profile picture to like other profiles" : ""}
									>
										<Heart className="w-5 h-5" />
										<span>{isChangingStatus ? "Saving" : "Like!"}</span>
									</button>
								</div>
							) : (
								<div className="flex flex-col items-center space-y-2">
									<h2 className="text-xl font-semibold text-gray-800">
										You blocked {userProfile.username}.
									</h2>
									<h2 className="text-xl font-semibold text-gray-800">
										You can't have any relationship with them.
									</h2>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			
            <div className='flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-4xl'>
                    {userProfile && !loading && (
						<>
							{/* Profile Header */}
							<div className="text-center mb-8">
								<img
									src={userProfile.image || "/avatar.webp"}
									alt={`${userProfile.username}'s profile`}
									className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#4e7156] shadow-lg"
								/>
								<h2 className="mt-4 text-3xl font-bold text-gray-900">{userProfile.username}</h2>
								<h2 className="mt-2 text-3xl font-bold text-gray-900">{userProfile.first_name} {userProfile.last_name}, {userProfile.age}</h2>
								{isOnline ?
									<>
										<h3 className="mt-2">{`${userProfile.username} is connected right now!`}</h3>
									</>
									:
									<>
										<h3 className="mt-2">Last time seen on Matcha: {new Date(userProfile.last_connection).toLocaleDateString()}</h3>
										<h3>at {new Date(userProfile.last_connection).toLocaleTimeString()}</h3>
									</>
								}
								<p className="mt-4 text-sm text-gray-500">Located in {userProfile.city}</p>
								<p className="text-sm text-gray-500">Birthday: {new Date(userProfile.birthday).toLocaleDateString()}</p>
							</div>

							{/* Main Profile Info */}
							<div className="bg-[#fdfdfad9] shadow-md rounded-lg p-6">
								<h3 className="text-xl font-semibold text-[#344c39]">About {userProfile.first_name}</h3>
								<p className="mt-2 text-gray-600 break-all">{userProfile.bio}</p>

								{/* Tags */}
								<div className="mt-4">
									<h4 className="text-md font-medium text-[#4e7156]">Tags</h4>
									<div className="flex flex-wrap gap-2 mt-2">
										{userProfile.tags.map((tag, index) => (
											<span
												key={index}
												className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
											>
												{tag}
											</span>
										))}
									</div>
								</div>

								{/* Preferences */}
								<div className="mt-4">
									<p className="text-gray-600 text-sm">
										{`Gender: ${userProfile.gender}`}
									</p>
									<p className="text-gray-600 text-sm">
										{`Orientation: ${userProfile.gender_preference === 'both' ? 'bisexual' :
										userProfile.gender_preference === 'male' ? userProfile.gender === 'male' ? 'gay' : 'straight' :
										userProfile.gender === 'male' ? 'straight' : 'lesbian'}`}
									</p>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-4">
									{/* Distance From Us */}
									<div className="bg-gray-100 rounded-lg p-4 text-center">
										<h4 className="text-lg font-bold text-[#8ba888]">Distance</h4>
										<div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 w-full">
											<div className="flex items-center gap-1">
												<MapPin className="w-5 h-5 text-[#8ba888]" />
												<p className="text-gray-700 text-sm">{userProfile.city} ({userProfile.loc?.components?.postcode})</p>
											</div>
											{userProfile.distance && (
												<p className="text-gray-700 text-sm">{userProfile.distance.toFixed(0)}km away from you</p>
											)}
										</div>
									</div>
									{/* Fame Rating */}
									<div className="bg-gray-100 rounded-lg p-4 text-center">
										<h4 className="text-lg font-bold text-[#8ba888]">Fame Rate</h4>
										{userProfile && <>
											<p className="text-gray-700 text-sm">{userProfile.match_nbr} matches / {userProfile.likes.length} likes</p>
											<p className="text-gray-700 text-sm">{userProfile.likes.length > 0
												? `${((userProfile.match_nbr / userProfile.likes.length) * 100).toFixed(0)}%`
												: "0%"}</p>
										</>}
									</div>
								</div>

								{/* Sign up date */}
								<div className="mt-4">
									<h4 className="text-md font-medium text-gray-800">On swipe since</h4>
									<p className="text-gray-600 text-sm">{new Date(userProfile.created_at).toLocaleDateString()}</p>
								</div>
							</div>

							{/* Photo Gallery */}
							<div className='mt-8'>
								<h3 className='text-xl font-semibold text-gray-800'>Photos</h3>
								<div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4'>
									{userProfile.images &&
										userProfile.images.map((image, index) => (
											<div
												key={index}
												className='relative group cursor-pointer'
												onClick={() => openImageModal(image)}
											>
												<img
													src={image}
													alt={`User photo ${index + 1}`}
													className='w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm'
												/>
											</div>
										))
									}
									{!userProfile.images.length === 0 &&
										<div className="mt-4">
											<p className="text-gray-600 text-sm">This user has no pictures yet</p>
										</div>
									}

								</div>
							</div>
						</>
                    )}
                    {!userProfile && !loading && (
    					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>No profile found</h2>
                    )}
					{loading && <LoadingState />}
				</div>
            </div>

			<Modal
				isOpen={!!selectedImage}
				onRequestClose={closeImageModal}
				contentLabel="View Image"
				className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
				overlayClassName="fixed inset-0 bg-black bg-opacity-50"
			>
				<div className='relative'>
					<img
						src={selectedImage}
						alt="Selected"
						className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
					/>
					<button
						onClick={closeImageModal}
						className='absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-200'
					>
						x
					</button>
				</div>
			</Modal>
			<Footer/>
        </div>
    );
};

const LoadingState = () => {
	return (
		<div className='relative w-full max-w-sm h-[28rem]'>
			<div className='card bg-white w-96 h-[28rem] rounded-lg overflow-hidden
                            border border-gray-200 shadow-sm'>
				<div className='px-4 pt-4 h-3/4'>
					<div className='w-full h-full bg-gray-200 rounded-lg' />
				</div>
                <Loader className='text-green-500 mb-4 animate-spin' size={48} />
				<div className='card-body bg-gradient-to-b from-white to-green-50 p-4'>
					<div className='space-y-2'>
						<div className='h-6 bg-gray-200 rounded w-3/4' />
						<div className='h-4 bg-gray-200 rounded w-1/2' />
					</div>
				</div>
			</div>
		</div>
	);
}; 

export default ProfilePage