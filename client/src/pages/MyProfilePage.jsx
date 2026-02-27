import { useRef, useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore'
import { useUserStore } from '../store/useUserStore';
import Geolocation from 'react-native-geolocation-service';
import { useTagStore } from '../store/useTagStore';
import { View, MapPin } from 'lucide-react'
import Modal from "react-modal";
import toast from "react-hot-toast";
import { Link, useLocation } from 'react-router-dom';

const MyProfilePage = () => {
	const { checkAuth } = useAuthStore();
	const authUser = useAuthStore((state) => state.authUser);
	const [username, setUsername] = useState(authUser.username || "");
    const [first_name, setFirstName] = useState(authUser.first_name || "");
    const [last_name, setLastName] = useState(authUser.last_name || "");
	const [email, setEmail] = useState(authUser.email || "");
	const {pendingEmail} = useState(authUser.pending_email || "");
	const [bio, setBio] = useState(authUser.bio || "");
	const [gender, setGender] = useState(authUser.gender || "");
	const [gender_preference, setGenderPreference] = useState(authUser.gender_preference || "");
	const [image, setImage] = useState(null);
    const [ showViews, setShowViews ] = useState(false);
	const [ loc, setLoc ] = useState(false);
    const locRef = useRef(null);
    const viewsRef = useRef(null);
	const [country, setCountry] = useState(null);
    const [currentState, setCurrentState] = useState(null);
	const [currentCity, setCurrentCity] = useState(null);

	const fileInputRef = useRef(null);

	const views = useUserStore((state) => state.views);
	const { setLocResults, searchLocation, setLocAuthorization, has_allowed_loc, loading,updateEmail,
		updateProfile, updateLocation, deletePicture, setProfilePicture, getProfileViews} = useUserStore();
	const locResults = useUserStore((state) => state.locResults);

	const [searchTag, setSearchTag] = useState("");
	const [newTag, setNewTag] = useState("");
	// variables
	const {similarTags, popularTags, userTags} = useTagStore();
	// functions
	const {fetchPopularTags, fetchSimilarTags, createTag, addTagToUser, fetchUserTags, removeTagFromUser} = useTagStore();

    const [selectedImage, setSelectedImage] = useState(null);

	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState(null);
	
	const openImageModal = (image) => {
        setSelectedImage(image);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

	const deleteImage = (image) => {
		deletePicture(image);
	}

	const setAsProfilePicture = (image) => {
		setProfilePicture(image);
	}

    const toggleViews = () => {
        setShowViews(prev => !prev);
    };

    const openLoc = () => {
        setLoc(prev => !prev);
    };

	const handleSearch = async(search) => {
		if (search) {
			fetchSimilarTags(search);
		}
	};

	const locateMe = async(hasClicked) => {
		Geolocation.getCurrentPosition(
			(position) => {
				localStorage.setItem('locasked', 'true');
				localStorage.setItem('locallowed', 'true');
				updateLocation(position.coords.latitude, position.coords.longitude);
				setLocAuthorization(true);
				checkAuth();
			},
			(error) => {
				if (error.code === 1) {
					localStorage.setItem('locasked', 'true');
					if (!hasClicked)
						setLocAuthorization(false);
					else {
						localStorage.setItem('locallowed', 'true');
						setLocAuthorization(true);
					}
				}
				updateLocation(null, null);
				checkAuth();
			},
			{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
		);
	};

	useEffect(() => {
		// ask for location when launching the page except if it has already been asked before
		const hasLocationBeenAsked = localStorage.getItem('locasked');
		if (!hasLocationBeenAsked) {
		  locateMe(false);
		}
	}, []);
	
	
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (locRef.current && !locRef.current.contains(event.target)) {
				setLoc(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
	}, []);

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
		fetchPopularTags();
		fetchUserTags(authUser.id);
	}, [fetchPopularTags, fetchUserTags]);

	
    useEffect(() => {
		getProfileViews();
    }, []);

	const handleSuppressTag = async(tag_name) => {
		await removeTagFromUser(tag_name);
		await fetchUserTags(authUser.id);
		await fetchPopularTags();
	}

	const handleAddTag = async() => {
		if (newTag) {
			const ret = await createTag(newTag);
			if (ret != false) {
				await addTagToUser(newTag);
				await fetchUserTags(authUser.id);
				await fetchPopularTags();
				setNewTag("");
			}
		}
	};

	const handleAddTagFromSuggestion = async(tag_name) => {
		await createTag(tag_name);
		await addTagToUser(tag_name);
		await fetchUserTags(authUser.id);
		await fetchPopularTags();
};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (authUser.images.length >= 5 && image != null && image != "") {
			toast.error("You can't have more than 5 pictures.");
			setImage(null);
		}
		if (authUser.email != email)
			updateEmail(email);
		updateProfile({ username, first_name, last_name, bio, gender, gender_preference, image });
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result);
			}
			reader.readAsDataURL(file);
		}
	};

	const handleCitySearch = async (cityQuery) => {
		if (cityQuery.length < 3) {
				setLocResults([]);
				return;
		}
		try {
			await searchLocation(cityQuery);
		} catch (error) {
			setLocResults([]);
			return;
		}
	};
	
	const handleSelectLocation = (location) => {
		setSelectedLocation(location);
		setResults([]);
		setQuery(location.formatted);
	};

	const setNewLocation = async (selectedLocation) => {
		await updateLocation(selectedLocation.geometry.lat, selectedLocation.geometry.lng);
	};


	return (
		<div className='min-h-screen bg-[#F0F5EA] flex flex-col'>
			<Header />
			<div className='relative flex justify-end mt-6 px-6'>
				<View className='text-[#44624a] cursor-pointer' size={30}
					onClick={toggleViews} />
				{showViews && (
					<div ref={viewsRef} className={`absolute max-h-[50vh] ${views && views.length > 0 ? "min-h-[150px]" : ""}
													overflow-y-auto top-14 right-5 w-80 bg-white shadow-lg border
													border-gray-200 rounded-lg p-4 z-50`}>
						<h3 className="font-semibold text-xl text-gray-900 mb-4">Views</h3>
						<div className='space-y-4'>
							{views && views.length > 0 ? (
								views.map((view) => (
									<Link
										to={`/profile/${view.viewer_username}`}
										key={view.id}
									>
										<div
											className="flex items-center gap-4 p-3 bg-gradient-to-r from-white
													 to-green-50 rounded-md shadow-sm hover:shadow-md transition-shadow"
										>
											<img
												src={view.viewer_image || "/avatar.webp"}
												alt={view.viewer_username}
												className="w-12 h-12 rounded-full object-cover pointer-events-none"
											/>
											<div>
												<p className='text-gray-800 font-medium text-sm'>
													{view.viewer_username} viewed your profile {view.view_count} times
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
			<div className='flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-3xl'>
					<h2 className='text-center text-3xl font-extrabold text-[#344c39]'>Your Profile</h2>
				</div>

				{/* Photo Gallery */}
				<div className='mt-4'>
					<h3 className='text-xl font-semibold text-gray-800'>Photos</h3>
					<div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4'>
						{authUser.images &&
							authUser.images.map((image, index) => (
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
									<button
										onClick={(event) => {
											event.stopPropagation();
											deleteImage(image);
										}}
										className='absolute top-4 right-4 bg-[#f5f3ee] text-gray-800 p-2 rounded-full shadow hover:bg-gray-400 hover:text-white transition-colors duration-200'
									>
										delete
									</button>
									{image != authUser.image &&
										<button
											onClick={(event) => {
												event.stopPropagation();
												setAsProfilePicture(image);
											}}
											className='absolute top-4 left-4 bg-gray-200 text-gray-800 p-2 rounded-full shadow hover:bg-[#8ba888] hover:text-white transition-colors duration-200'
											title="Set as profile picture"
										>
											select
										</button>
									}
									{image == authUser.image &&
										<div
											className='absolute top-4 left-4 p-2 rounded-full shadow bg-[#8ba888] text-white '
											title="Set as profile picture"
										>
											selected!
										</div>
									}
								</div>
							))
						}
						{authUser.images.length === 0 &&
							<div className="mt-4">
								<p className="text-gray-600 text-sm">You have no pictures yet</p>
							</div>
						}

					</div>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-4">
					{/* Location */}
					<div className="bg-[#fdfdfad9] rounded-lg p-4 text-center">
						<h4 className="text-lg font-bold text-[#8ba888]">
							Location
						</h4>
						{authUser.allowed_loc || localStorage.getItem('locallowed') ?
							<p className="text-gray-700 text-sm">You are located in {authUser.city} ({authUser.loc?.components?.postcode})</p>
							:
							<p className="text-gray-700 text-sm">You refused to give your location...</p>
						}
						<div className='mt-4 flex justify-center'>
							<div className='mx-4 flex flex-col max-w-xs sm:flex-row justify-center sm:justify-evenly items-center space-y-2 sm:space-y-0 sm:space-x-4'>
								<div className='relative'>
									<button
										type='button'
										className=' text-gray-900 text-sm font-semibold hover:text-green-500'
										onClick={() => {openLoc(!loc);}}
									>
										Edit
									</button>
									{loc ? (
										<div
											ref={locRef}
											className={`absolute top-full left-1/2 -translate-x-1/2 w-56 mt-2 p-4 bg-white shadow-lg border border-gray-200 rounded-lg z-50`}
										>
											<h3 className="font-semibold text-m text-gray-900 mb-4">Search city</h3>
											<div className="space-y-4">
												<div className="relative">
													<div>
														<input
															type="text"
															value={query}
															maxLength="42"
															onChange={(e) => {
															setQuery(e.target.value);
															handleCitySearch(e.target.value);
															}}
															placeholder="Enter a city..."
															className="bg-white text-gray-900 text-sm w-full p-2 border border-gray-300 rounded"
														/>
														{locResults.length > 0 && (
															<ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white shadow-lg rounded border border-gray-300">
															{locResults.map((place) => (
																<li
																key={place.geometry.lat + place.geometry.lng}
																onClick={() => { handleSelectLocation(place)
																	setNewLocation(place)
																	openLoc(!loc);
																}}
																
																className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200"
																>
																{place.formatted}
																</li>
															))}
															</ul>
														)}
														{selectedLocation && (
															<div className="mt-4">
																<h3>Selected location :</h3>
																<p>{selectedLocation.formatted}</p>
																<p>Latitude: {selectedLocation.geometry.lat}</p>
																<p>Longitude: {selectedLocation.geometry.lng}</p>
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									) : (
										<></>
									)}
								</div>
								<span className="text-gray-900 text-sm">or</span>
								<button
									type="button"
									className="inline-flex items-center text-gray-900 text-sm font-semibold hover:text-green-500"
									onClick={locateMe}
								>
									<MapPin className="w-3 mr-1" />
									Locate me
								</button>
							</div>
						</div>
						
					</div>
		
					{/* Fame Rating */}
					<div className="bg-[#fdfdfad9] rounded-lg p-4 text-center">
						<h4 className="text-lg font-bold text-[#8ba888]">Fame Rate</h4>
						{authUser && <>
							<p className="text-gray-700 text-sm">{authUser.match_nbr} matches / {authUser.likes.length} likes</p>
							<p className="text-gray-700 text-sm">{authUser.likes.length > 0
								? `${((authUser.match_nbr / authUser.likes.length) * 100).toFixed(0)}%`
								: "0%"}</p>
						</>}
					</div>
				</div>
				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6'>

					{/* Profile Form */}
					<div className='bg-[#fdfdfad9] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#f1ebe1]'>
						<h1 className="text-2xl font-bold mb-4 text-[#8ba888]">Info</h1>
						<form onSubmit={handleSubmit} className='space-y-6'>
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
										className='appearance-none block w-full px-3 py-2 border border-gray-300
										 rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
										 focus:border-green-500 sm:text-sm'
									/>
								</div>
							</div>
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
										className='appearance-none block w-full px-3 py-2 border border-gray-300
										 rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
										 focus:border-green-500 sm:text-sm'
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
										className='appearance-none block w-full px-3 py-2 border border-gray-300
										 rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
										 focus:border-green-500 sm:text-sm'
									/>
								</div>
							</div>

							{/* EMAIL */}
							<div>
								<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
									Email
								</label>
								<div className='mt-1'>
									<input
										id='email'
										name='email'
										type='email'
										required
										value={email}
										maxLength="255"
										onChange={(e) => setEmail(e.target.value)}
										className='appearance-none block w-full px-3 py-2 border border-gray-300
										 rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
										 focus:border-green-500 sm:text-sm'
									/>
								</div>
								{ authUser.pending_email && authUser.pending_email.length > 0 &&
								<p className="text-black text-sm">
									{`Please confirm: ${authUser.pending_email}`}
								</p>
								}
							</div>

							{/* GENDER */}
							<div>
								<span className='block text-gray-700 mb-2 font-semibold'>Gender</span>
								<div className='flex space-x-4'>
									{["Male", "Female"].map((option) => (
										<label key={option} className='inline-flex items-center text-gray-900'>
											<input
												type='radio'
												className='form-radio'
												name='gender'
												value={option.toLowerCase()}
												checked={gender === option.toLowerCase()}
												onChange={() => setGender(option.toLowerCase())}
											/>
											<span className='ml-2'>{option}</span>
										</label>
									))}
								</div>
							</div>

							{/* GENDER PREFERENCE */}
							<div>
								<span className='block text-gray-700 mb-2 font-semibold'>Gender Preference</span>
								<div className='flex space-x-4'>
									{["Male", "Female", "Both"].map((option) => (
										<label key={option} className='inline-flex items-center text-gray-900'>
											<input
												type='radio'
												className='form-radio text-green-600'
												name='gender_preference'
												value={option.toLowerCase()}
												checked={gender_preference === option.toLowerCase()}
												onChange={() => setGenderPreference(option.toLowerCase())}
											/>
											<span className='ml-2'>{option}</span>
										</label>
									))}
								</div>
							</div>

							{/* BIO */}
							<div>
								<label htmlFor='bio' className='block text-gray-700 mb-2 font-semibold'>
									Bio
								</label>
								<div className='mt-1'>
									<textarea
										id='bio'
										name='bio'
										rows={3}
										value={bio}
										maxLength="255"
										onChange={(e) => setBio(e.target.value)}
										className='appearance-none block w-full px-3 py-2 border border-gray-300 
										rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
										focus:border-green-500 sm:text-sm'
									/>
								</div>
							</div>

							{/* IMAGE */}
							<div>
								<label className='block text-gray-700 mb-2 font-semibold'>Cover Image</label>
								<div className='mt-1 flex items-center'>
									<button
										type='button'
										onClick={() => fileInputRef.current.click()}
										className='inline-flex items-center px-4 py-2 border border-gray-300
										rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
										focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
									>
										Upload Image
									</button>
									<input
										ref={fileInputRef}
										type='file'
										accept='image/*'
										className='hidden'
										onChange={handleImageChange}
									/>
								</div>
							</div>

							{image && (
								<div className='mt-4'>
									<img src={image} alt='User Image' className='w-48 h-full object-cover rounded-md' />
								</div>
							)}

							<button
								type='submit'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md
								shadow-sm text-sm font-medium text-[#f5f3ee] bg-[#8ba888] hover:bg-[#789175] 
								focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#98b794]'
								disabled={loading}
							>
								{loading ? "Saving..." : "Save"}
							</button>
						</form>
					</div>

					{/* Tags section */}
					<div className='bg-[#fdfdfad9] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#f1ebe1]'>
						<h1 className="text-2xl font-bold mb-4 text-[#8ba888]">Tags</h1>

						{/* {loading_tag && <p>Loading...</p>} */}

						{/* Popular tags */}
						<div className="mb-4">
							<h2 className="block text-gray-700 mb-2 font-semibold">Popular Tags</h2>
							<div className="flex flex-wrap gap-2 mt-2">
								{popularTags.length > 0 ? (
									popularTags.map((tag) => (
										<span
											key={tag.tag_name}
											className="relative bg-gray-200 text-gray-800 px-2 py-1 rounded-md cursor-pointer
														hover:bg-[#8ba888] hover:text-white transition-colors duration-200 flex items-center"
											onClick={(e) => handleAddTagFromSuggestion(tag.tag_name)}
											title="Add"
										>
											{tag.tag_name}
										</span>
									))
								) : (
									<p>No tags yet</p>
								)}
							</div>
						</div>

						{/* Search for similar tags */}
						<div className="mb-4">
							<h2 className="block text-gray-700 mb-2 font-semibold">Search for Tags</h2>
							<input
								type="text"
								value={searchTag}
								maxLength="255"
								onChange={(e) => {
									setSearchTag(e.target.value.toLowerCase());
									handleSearch(e.target.value.toLowerCase());
								}}
								placeholder="Type to search..."
								className="appearance-none block w-full px-3 py-2 border border-gray-300
											rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-green-500
											focus:border-[#8ba888] sm:text-sm"
							/>
							<div className="flex flex-wrap gap-2 mt-2">
								{similarTags.length > 0 ? (
									similarTags.map((tag) => (
										<span
											key={tag.tag_name}
											className="relative bg-gray-200 text-gray-800 px-2 py-1 rounded-md cursor-pointer
														hover:bg-[#8ba888] hover:text-white transition-colors duration-200 flex items-center"
											onClick={(e) => handleAddTagFromSuggestion(tag.tag_name)}
											title="Add"
										>
											{tag.tag_name}
										</span>
									))
								) : (
									<p>No tags found</p>
								)}
							</div>
						</div>

						{/* Add new tag */}
						<div className="mb-4">
							<h2 className="block text-gray-700 mb-2 font-semibold">Add a New Tag</h2>
							<input
								type="text"
								value={newTag}
								maxLength="255"
								onChange={(e) => setNewTag(e.target.value.toLowerCase())}
								placeholder="New tag name"
								className="appearance-none block w-full px-3 py-2 border border-gray-300
											rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-[#8ba888]
											focus:border-[#8ba888] sm:text-sm"
							/>
							<button
								onClick={handleAddTag}
								className="mt-2 w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium text-[#f5f3ee] bg-[#8ba888] hover:bg-[#789175] 
								focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#98b794]"
							>
								Add
							</button>
						</div>

						{/* Your tags*/}
						<div className="mb-4">
							<h2 className="block text-gray-700 mb-2 font-semibold">Your tags</h2>
							<div className="flex flex-wrap gap-2 mt-2">
								{userTags.length > 0 ? (
									userTags.map((tag) => (
										<span
											key={tag.tag_name}
											className="relative bg-[#f5f3ee] text-gray-800 px-2 py-1 rounded-md cursor-pointer
														hover:bg-[#db6a6aea] hover:text-white transition-colors duration-200 flex items-center"
											onClick={(e) => handleSuppressTag(tag.tag_name)}
											title="Delete"
										>
											{tag.tag_name} &times;
										</span>
									))
								) : (
									<p>No tags yet</p>
								)}
							</div>
						</div>
					</div>
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

export default MyProfilePage