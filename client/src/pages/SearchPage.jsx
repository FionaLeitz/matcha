import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSearchStore } from "../store/useSearchStore";
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from '../store/useAuthStore'
import { useMatchStore } from '../store/useMatchStore'
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Heart, Loader, ArrowDownWideNarrow, Binoculars, HandHeart, MapPin } from 'lucide-react'

const SearchPage = () => {
    let { usersFoundSorted, isLoading, sortUsersFound } = useSearchStore();
	const syncWithURL = useSearchStore((state) => state.syncWithURL);
	const getResults = useSearchStore((state) => state.getResults);
	const { views, getProfileViewed, likes, getProfileLikes } = useUserStore();
    const { checkAuth } = useAuthStore();
	const authUser = useAuthStore((state) => state.authUser);
	const { unlike, like } = useMatchStore();
    const [ showSortOptions, setShowSortOptions ] = useState(false);
    const [ sort, setSort ] = useState("");
    const sortRef = useRef(null);
    const [ showViews, setShowViews ] = useState(false);
    const viewsRef = useRef(null);
    const [ showLikes, setShowLikes ] = useState(false);
    const likesRef = useRef(null);

	const [searchParams] = useSearchParams();

	useEffect(() => {
		syncWithURL(searchParams);

		const query = searchParams.get("query") || "";
		const ageRange = [
			searchParams.get("minAge") || "18",
			searchParams.get("maxAge") || "100"
		];
		const fameRange = [
			searchParams.get("minFame") || "0",
			searchParams.get("maxFame") || "100"
		];
		const selectedTags = searchParams.get("selectedTags") 
			? searchParams.get("selectedTags").split(",") 
			: [];
		const selectedDistance = searchParams.get("distance") || "-1"
		getResults(query, ageRange, fameRange, selectedTags, selectedDistance);
	}, [searchParams, syncWithURL]);


    const toggleSort = () => {
        setShowSortOptions(prev => !prev);
    };

    useEffect(() => {
        sortUsersFound(sort);
    }, [sort]);

	useEffect(() => {
		getProfileViewed();
		getProfileLikes();
	}, []);

    const handleSort = (sortType) => {
        setSort(prevSort => prevSort === sortType ? "" : sortType)
    }

    useEffect(() => {
		const handleClickOutside = (event) => {
			if (sortRef.current && !sortRef.current.contains(event.target)) {
				setShowSortOptions(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
	}, []);

	const handleUnlike = async (userProfile) => {
		await unlike(userProfile);
		await checkAuth();
	};

	const handleLike = async (userProfile) => {
		await like(userProfile);
		await checkAuth();
	};

    const toggleViews = () => {
        setShowViews(prev => !prev);
    };

    const toggleLikes = () => {
        setShowLikes(prev => !prev);
    };

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (viewsRef.current && !viewsRef.current.contains(event.target)) {
				setShowViews(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (likesRef.current && !likesRef.current.contains(event.target)) {
				setShowLikes(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
	}, []);

    return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
            <Header />
			<div className='relative flex justify-between py-2 top-2 px-6'>
				<HandHeart
					className='text-[#4e7156] cursor-pointer'
					size={30}
					onClick={toggleLikes}
				/>
				{showLikes && (
					<div ref={likesRef} className={`absolute max-h-[50vh] ${likes && likes.length > 0 ? "min-h-[150px]" : ""}
													overflow-y-auto top-14 w-80 bg-white shadow-lg border
													border-gray-200 rounded-lg p-4 z-50`}>
						<h3 className="font-semibold text-xl text-gray-900 mb-4">Likes</h3>
						<div className='space-y-4'>
							{likes && likes.length > 0 ? (
								likes.map((like) => (
									<Link
										to={`/profile/${like.username}`}
										key={like.id}
									>
										<div
											className="flex items-center gap-4 p-3 bg-gradient-to-r from-white
													 to-green-50 rounded-md shadow-sm hover:shadow-md transition-shadow my-2"
										>
											<img
												src={like.image || "/avatar.webp"}
												alt={like.username}
												className="w-12 h-12 rounded-full object-cover pointer-events-none"
											/>
											<div>
												<p className='text-gray-800 font-medium text-sm'>
													{like.username} liked your profile
												</p>
												{authUser.likes.includes(like.id) ?
													<p className="text-gray-500 text-xs">
														And it's a match!
													</p> :
													<p className="text-gray-500 text-xs">
														Want to like them back?
													</p>
												}
											</div>
										</div>
									</Link>
								))
							) : (
								<p className="text-gray-500 text-sm">No likes yet.</p>
							)}
						</div>
					</div>
				)}
				<Binoculars
					className='text-[#4e7156] cursor-pointer'
					size={30}
					onClick={toggleViews}
				/>
				{showViews && (
					<div ref={viewsRef} className={`absolute max-h-[50vh] ${views && views.length > 0 ? "min-h-[150px]" : ""}
													overflow-y-auto top-14 right-5 w-80 bg-white shadow-lg border
													border-gray-200 rounded-lg p-4 z-50`}>
						<h3 className="font-semibold text-xl text-gray-900 mb-4">Views</h3>
						<div className='space-y-4'>
							{views && views.length > 0 ? (
								views.map((view) => (
									<Link
										to={`/profile/${view.viewed_username}`}
										key={view.id}
									>
										<div
											className="flex items-center gap-4 p-3 bg-gradient-to-r from-white
													 to-green-50 rounded-md shadow-sm hover:shadow-md transition-shadow my-2"
										>
											<img
												src={view.viewed_image || "/avatar.webp"}
												alt={view.viewed_username}
												className="w-12 h-12 rounded-full object-cover pointer-events-none"
											/>
											<div>
												<p className='text-gray-800 font-medium text-sm'>
													You view {view.viewed_username}'s profile {view.view_count} times
												</p>
												<p className="text-gray-500 text-xs">
													Last viewed on {new Date(view.viewed_at).toLocaleString()}
												</p>
											</div>
										</div>
									</Link>
								))
							) : (
								<p className="text-gray-500 text-sm">No views yet.</p>
							)}
						</div>
					</div>
				)}
			</div>
			<div className="flex-grow p-4">
				<div className='flex flex-col md:flex-row gap-8'>
					<div className='flex-[3]'>
                        <div className='relative flex flex-row items-center mb-4'>
                            <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                            <button
                                onClick={toggleSort}
                                className="ml-2"
                                aria-label="Sort options"
                                title="sort options"
                            >
                                <ArrowDownWideNarrow className='text-[#4e7156]' size={20} />
                            </button>
							{/* Sort options */}
                            {showSortOptions && (
                                <div ref={sortRef} className='absolute bg-white shadow-lg ml-20 p-4 z-50 rounded-lg'>
                                    <h3 className="font-semibold">Sort Options</h3>
                                    <div className='flex flex-col'>
                                        {["Age", "Tag", "Distance", "Fame rating"].map((option) => (
                                            <label key={option} className='inline-flex items-center text-gray-900'>
                                                <input
                                                    type='checkbox'
                                                    className='form-checkbox'
                                                    name='sort'
                                                    value={option.toLowerCase()}
                                                    checked={sort === option.toLowerCase()}
                                                    onChange={() => {
                                                        handleSort(option.toLowerCase())
                                                    }}
                                                />
                                                <span className='ml-2'>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{usersFoundSorted.length > 0 && !isLoading && usersFoundSorted.map((user) => (
								<Link
									to={`/profile/${user.username}`}
									key={user.id}
									className="card bg-white w-full max-w-[20rem] h-[38rem] select-none rounded-lg overflow-hidden
													border border-gray-200"
								>
									<figure className="h-3/4">
										{authUser.username != user.username &&
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
												<div
													className={`absolute top-2 right-2 h-2 w-2 z-10 rounded-lg
																${user.is_connected ? 'bg-green-600' : 'bg-red-600'} `}
													title={user.is_connected ? "online" : "offline"}
												/>
											</div>
										}
										<LazyLoadImage
											src={user.image || "/avatar.webp"}
											alt={user.username}
											className='w-full h-full object-cover pointer-events-none'
										/>
									</figure>
									<div className="card-body bg-gradient-to-b from-white to-green-50">
										<div className='flex items-center justify-between'>
											<h2 className='text-xl font-semibold text-gray-800 truncate w-3/4'>
												{user.username}
											</h2>
											<span className='text-lg text-gray-600'>{user.age}</span>
										</div>
										<div className="flex items-stretch text-sm text-gray-700">
											<MapPin className='w-4' />
											<p className='text-sm px-1'>{user.city} ({user.loc?.components?.postcode})</p>
											{user.distance ?
												<p className='text-sm px-1'> {user.distance.toFixed(0)}km away from you</p>
											:
												<></>
											}
										</div>
										<div className="my-3 border-t border-gray-200"/>
										<p className='text-sm'>Fame: {user.likes.length > 0
											? `${((user.match_nbr / user.likes.length) * 100).toFixed(0)}%`
											: "0%"}</p>
										<p className="text-gray-600 text-sm truncate break-all">{user.bio}</p>
										<div className="flex flex-wrap gap-2 overflow-hidden max-h-[3rem]">
											{user.tags.length > 0 && user.tags.map((tag, index) => (
												<span
													key={index}
													className="bg-[#DFECCF] text-gray-800 px-2 py-1 rounded-md text-xs"
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								</Link>
							))}
						</div>
						{isLoading && <LoadingState />}
						{usersFoundSorted && usersFoundSorted.length === 0 &&
							<div>No user corresponds to you research.</div>
						}
					</div>
				</div>
			</div>
            <Footer/>
        </div>
    )
}

export default SearchPage

const LoadingState = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Loader className='text-green-500 mb-4 animate-spin' size={48} />
		<h3 className='text-x1 font-semibold text-gray-700 mb-2'>Loading Search</h3>

	</div>
);