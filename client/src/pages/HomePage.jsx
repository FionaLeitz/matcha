import React, { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useMatchStore } from '../store/useMatchStore';
import { Frown, ArrowDownWideNarrow, Sparkle, List, IdCard } from 'lucide-react';
import SwipeArea from '../components/SwipeArea';
import SwipeFeedback from '../components/SwipeFeedback';
import ListView from '../components/ListView';
import { Range } from "react-range";

const HomePage = () => {
	const {sortUsers, getUserProfile, isLoadingUserProfiles, applyFilterToUsers} = useMatchStore();
	const userProfiles = useMatchStore((state) => state.sortedUserProfiles);
	const {restoreDisliked} = useUserStore();
	const {authUser} = useAuthStore();
	const [showOptions, setShowOptions] = useState(false);
	const optionsRef = useRef(null);
	const [ageRange, setAgeRange] = useState([18, 100]);
	const [fameRange, setFameRange] = useState([0, 100]);
	const [distanceSelected, setDistanceSelected] = useState(500);
	const [isDistanceFilterActive, setIsDistanceFilterActive] = useState(false);
	const [tags, setTags] = useState([]);
	const [ showSortOptions, setShowSortOptions ] = useState(false);
	const [ sort, setSort ] = useState("");
	const sortRef = useRef(null);
	const [ listView, setListView ] = useState(false);
	const [ filters, setFilters ] = useState(false);


	useEffect(() => {
		getUserProfile();
	}, [getUserProfile]);

	useEffect(() => {
		sortUsers(sort, authUser.tags);
	}, [sort]);

	useEffect(() => {
		applyFilterToUsers(ageRange, fameRange, distanceSelected, tags, isDistanceFilterActive, sort);
		sortUsers(sort, authUser.tags);
	}, [filters]);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
    };

    const toggleSort = () => {
        setShowSortOptions(prev => !prev);
    };

	const handleAddTag = (tag_name) => {
		if (!tags.includes(tag_name)) {
			setTags(tags.concat(tag_name));
		}
	};

	const handleSuppressTag = (tag_name) => {
		const updatedTags = tags.filter(tag => tag !== tag_name);
		setTags(updatedTags);
	};

    const handleDistanceChange = (e) => {
        setDistanceSelected(e.target.value);
    };

    const toggleDistanceFilter = () => {
        setIsDistanceFilterActive(!isDistanceFilterActive);
    };

	const handleSort = (sortType) => {
		setSort(prevSort => prevSort === sortType ? "" : sortType)
	};

	const handleViewType = async () => {
		setListView(!listView)
		if (listView) {
			await getUserProfile();
			await sortUsers(sort, authUser.tags);
		}
	};

	const restoreDislikedUsers = async () => {
		await restoreDisliked();
		await getUserProfile();
		await sortUsers(sort, authUser.tags);
	}

	const applyFilter = () => {
		setFilters(!filters);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (optionsRef.current && !optionsRef.current.contains(event.target)) {
				setShowOptions(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

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
	
	if (isLoadingUserProfiles) {
		return (
			<div className='flex flex-col lg:flex-row min-h-screen bg-gradient-to-br
							from-green-100 to-purple-100 overflow-hidden'>
				{/* <Sidebar /> */}
				<div className='flex-grow flex flex-col overflow-hidden'>
					{/* <Header /> */}
					<main className='flex-grow flex flex-col gap-10 justify-center
									 items-center p-4 relative overflow-hidden'>
						<LoadingState />
					</main>
				</div>
			</div>
		);
	}
	
	return (
		<div className='flex flex-col lg:flex-row min-h-screen bg-gradient-to-br
                        from-[#F0F5EA] to-[#F0F5EA] overflow-hidden'>
			<Sidebar />
			<div className='flex-grow flex flex-col overflow-hidden'>
				<Header />
				<main className='flex-grow flex flex-col relative overflow-hidden'>
					{/* Sort Button */}
					<div className='absolute top-4 left-0 right-0 flex justify-between items-center px-4'>
						<button
							onClick={toggleSort}
							className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
							aria-label="Sort options"
							title="Sort options"
						>
							<ArrowDownWideNarrow className='text-[#44624a]' size={26} />
						</button>

						{/* Sort options */}
						{showSortOptions && (
							<div
								ref={sortRef}
								className='absolute bg-white shadow-lg top-0 mt-12 p-4 z-50 rounded-lg min-w-[150px]'
							>
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

						{/* Select view Button */}
						<button
							onClick={handleViewType}
							className={`p-2 rounded-full bg-white shadow hover:bg-gray-100`}
							aria-label="List view"
							title={`${listView ? 'Cards' : 'List view'}`}
						>
							{listView ?
								<IdCard className='text-[#44624a]' size={26} />
							:
								<List className='text-[#44624a]' size={26} />
							}
						</button>

						{/* Refresh dislike Button */}
						<button
							onClick={restoreDislikedUsers}
							className={`p-2 rounded-full bg-white shadow hover:bg-gray-100 text-[#44624a]`}
							aria-label="Restore"
						>
							Restore disliked users
						</button>
					
						{/* Filter Button */}
						<button
							onClick={toggleOptions}
							className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
							aria-label="Filter Options"
							title='Filter options'
						>
							<Sparkle className='text-[#44624a]' size={26} />
						</button>
						
						{/* OPTION POPUP */}
						{showOptions && (
							<div ref={optionsRef} className="absolute bg-white top-0 mt-12 right-0 mr-3 shadow-lg p-6 z-50
													rounded-lg min-w-[280px] max-h-[80vh] overflow-y-auto max-w-[60vh] overflow-x-auto">
								<h3 className="text-xl font-extrabold text-gray-900">Filter Options</h3>

								{/* AGE */}
								<div className="mt-4">
									<label className="block text-gray-700 font-bold">Age Range</label>
									<div className="mt-2 py-3">
										<Range
											step={1} // step between every value possible
											min={18} // minimum value
											max={100} // maximum value
											values={ageRange} // define the value for the cursors (the thumbs)
											onChange={(values) => setAgeRange(values)} // changes the values of ageRange everytime we move the cursors
											renderTrack={({ props, children }) => { // function defines the "decoration" of the track
												const { key, ...restProps } = props;
												return (
													<div
														{...restProps}
														className="h-2 bg-gray-200 rounded border border-gray-300"
														style={{
															...restProps.style,
															// this is to have two colors of slider
															background: `linear-gradient(to right,
																		#F0F5EA ${((ageRange[0] - 18) / (100 - 18)) * 100}%,
																		#44624a ${((ageRange[0] - 18) / (100 - 18)) * 100}%,
																		#44624a ${((ageRange[1] - 18) / (100 - 18)) * 100}%,
																		#F0F5EA ${((ageRange[1] - 18) / (100 - 18)) * 100}%)`
														}}									  
													>
														{children}
													</div>
													// children are the cursors
												);
											}}
											renderThumb={({ props, index }) => { // function defines the "decoration" of the cursors
												const { key, ...restProps } = props;
												return (
													<div
														key={index}
														{...restProps}
														className="w-4 h-4 bg-[#8ba888] rounded-full border border-gray-300 shadow"
														style={{
														...restProps.style,
														}}
													>
														{/* LABELS */}
														<span className="absolute text-xs font-bold text-black -top-5">
															{ageRange[index]}
														</span>
													</div>
												);
											}}
										/>								
										<div className="text-sm text-gray-700 mt-1">
											Selected Age: <strong>{ageRange[0]} - {ageRange[1]}</strong>
										</div>
									</div>
								</div>

								{/* FAME */}
								<div className="mt-4">
									<label className="block text-gray-700 font-bold">Fame rating</label>
									<div className="mt-2 py-3">
										<Range
											step={1} // step between every value possible
											min={0} // minimum value
											max={100} // maximum value
											values={fameRange} // define the value for the cursors (the thumbs)
											onChange={(values) => setFameRange(values)} // changes the values of fameRange everytime we move the cursors
											renderTrack={({ props, children }) => { // function defines the "decoration" of the track
												const { key, ...restProps } = props;
												return (
													<div
														{...restProps}
														className="h-2 bg-gray-200 rounded border border-gray-300"
														style={{
															...restProps.style,
															// this is to have two colors of slider
															background: `linear-gradient(to right,
																		#F0F5EA ${((fameRange[0]) / (100)) * 100}%,
																		#44624a ${((fameRange[0]) / (100)) * 100}%,
																		#44624a ${((fameRange[1]) / (100)) * 100}%,
																		#F0F5EA ${((fameRange[1]) / (100)) * 100}%)`
														}}									  
													>
														{children}
													</div>
													// children are the cursors
												);
											}}
											renderThumb={({ props, index }) => { // function defines the "decoration" of the cursors
												const { key, ...restProps } = props;
												return (
													<div
														key={index}
														{...restProps}
														className="w-4 h-4 bg-[#8ba888] rounded-full border border-gray-300 shadow"
														style={{
														...restProps.style,
														}}
													>
														{/* LABELS */}
														<span className="absolute text-xs font-bold text-black -top-5">
															{fameRange[index]}
														</span>
													</div>
												);
											}}
										/>								
										<div className="text-sm text-gray-700 mt-1">
											Selected fame: <strong>{fameRange[0]} - {fameRange[1]}</strong>
										</div>
									</div>
								</div>

								{/* LOCATION */}
								<div className="mt-4">
									<label className="block text-gray-700 font-bold">Distance</label>
									<div className="flex items-center space-x-2">
										<input
											type="number"
											min="0"
											value={distanceSelected}
											onChange={handleDistanceChange}
											className="w-32 py-2 px-3 bg-[#8ba888] text-white border border-gray-300 rounded-md"
											disabled={!isDistanceFilterActive}
										/>
										<label className="text-gray-700 text-sm">
											<input
												type="checkbox"
												checked={!isDistanceFilterActive}
												onChange={toggleDistanceFilter}
												className="mr-2"
											/>
											No distance filter
										</label>
									</div>
									<div className="text-sm text-gray-700 mt-1">
										{isDistanceFilterActive ? (
											<>Selected maximum distance: <strong>{distanceSelected} km</strong></>
										) : (
											<>Distance filter is disabled.</>
										)}
									</div>
								</div>

								{/* Tags */}
								<div className="mt-4">
									<label className="block text-gray-700 font-bold">Tags</label>
									{/* Popular tags*/}
									<div className="mb-4">
										<h2 className="text-sm font-medium text-gray-500">Your Tags</h2>
										<div className="flex flex-wrap gap-2 mt-2">
											{authUser.tags.length > 0 ? (
												authUser.tags.map((tag) => (
													<span
														key={tag}
														className="relative bg-gray-200 text-gray-800 px-2 py-1 rounded-md cursor-pointer
																	hover:bg-[#8ba888] hover:text-white transition-colors duration-200 flex items-center"
														onClick={(e) => handleAddTag(tag)}
														title="Add"
													>
														{tag}
													</span>
												))
											) : (
												<p>You have no tags to select from yet</p>
											)}
										</div>
									</div>
									{/* Selected tags*/}
									<div className="mb-4">
										<h2 className="text-sm  font-medium text-gray-500">Tags selected</h2>
										<div className="flex flex-wrap gap-2 mt-2">
											{tags.length > 0 ? (
												tags.map((tag, index) => (
													<span
														key={index}
														className="relative bg-gray-200 text-gray-800 px-2 py-1 rounded-md cursor-pointer
																	hover:bg-[#db6a6aea] hover:text-white transition-colors duration-200 flex items-center"
														onClick={(e) => handleSuppressTag(tag)}
														title="Delete"
													>
														{tag} &times;
													</span>
												))
											) : (
												<p>No tags yet</p>
											)}
										</div>
									</div>
								</div>
								<button
									className='bg-[#8ba888] hover:bg-[#789175] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200'
									onClick={(e) => applyFilter()}
								>
									Apply filters
								</button>
							</div>
						)}
					</div>
					<div className="flex flex-grow gap-10 justify-center items-center h-full pt-16">
						{userProfiles.length > 0 && !isLoadingUserProfiles && !listView && <>
							<SwipeArea />
							<SwipeFeedback />
						</>}
						{userProfiles.length > 0 && !isLoadingUserProfiles && listView && <>
							<ListView />
						</>}
						{userProfiles.length === 0 && !isLoadingUserProfiles && (
							<NoMoreProfiles />
						)}
					</div>
				</main>
				<Footer />
			</div>
		</div>
	);
};

export default HomePage;

const NoMoreProfiles = () => (
	<div className='flex flex-col items-center justify-center h-full text-center
                    p-8'>
		<Frown className='text-[#587f60] mb-6' size={80} />
		<h2 className='text-3xl font-bold text-gray-800 mb-4'>No one is close enough from you</h2>
	</div>
);

const LoadingState = () => {
	return (
		<div className='relative w-full max-w-sm h-[28rem]'>
			<div className='card bg-white w-96 h-[28rem] rounded-lg overflow-hidden
                            border border-gray-200 shadow-sm'>
				<div className='px-4 pt-4 h-3/4'>
					<div className='w-full h-full bg-gray-200 rounded-lg' />
				</div>
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