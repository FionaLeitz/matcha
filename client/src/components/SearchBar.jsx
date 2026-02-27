import React, { useRef, useEffect, useState } from 'react';
import { Search, Sparkle } from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useTagStore } from '../store/useTagStore';
import { useNavigate } from 'react-router-dom';
import { Range } from "react-range";

const SearchBar = () => {
	const [searchQuery, setSearchQuery] = useState("")
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
	const [ageRange, setAgeRange] = useState([18, 100]);
	const [fameRange, setFameRange] = useState([0, 100]);
	const [distanceSelected, setDistanceSelected] = useState(500);
	const [isDistanceFilterActive, setIsDistanceFilterActive] = useState(false);
	const { goToSearch } = useSearchStore()
	const [tags, setTags] = useState([]);
    const navigate = useNavigate();
	const [searchTag, setSearchTag] = useState("");
	const {similarTags, popularTags} = useTagStore();
    const {fetchPopularTags, fetchSimilarTags} = useTagStore();

	useEffect(() => {
		fetchPopularTags();
	}, [fetchPopularTags]);

	const handleTagSearch = async(search) => {
		if (search) {
			fetchSimilarTags(search);
		}
	};

	const handleAddTagFromSuggestion = (tag_name) => {
        if (!tags.includes(tag_name)) {
            setTags(tags.concat(tag_name));
        }
	};

	const handleSuppressTag = (tag_name) => {
        const updatedTags = tags.filter(tag => tag !== tag_name);
        setTags(updatedTags);
	};

    const handleSearch = () => {
        const query = searchQuery.trim();
        goToSearch(query, ageRange, fameRange, tags, distanceSelected, isDistanceFilterActive, navigate);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDistanceChange = (e) => {
        setDistanceSelected(e.target.value);
    };

    const toggleDistanceFilter = () => {
        setIsDistanceFilterActive(!isDistanceFilterActive);
    };

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
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

	return (
		<header className='flex flex-grow'>
			{/* SEARCH BAR */}
			<div className='flex items-center bg-[#f5f3ee] px-4 py-1 rounded-md shadow-sm
							flex-grow sm:mt-0 '>
				<Search className='w-5 h-5 text-gray-500' />
				<input
					id='search'
					name='search'
					type='text'
					placeholder="Search..."
					value={searchQuery}
					maxLength="255"
					onChange={handleInputChange}
					className='appearance-none block w-full text-gray-900 bg-transparent
							focus:outline-none focus:ring-0 placeholder-gray-500 ml-2'
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<button
					onClick={toggleOptions}
					className="cursor-pointer w-10 h-8 p-2 flex items-center justify-center rounded-md
								bg-[#344c39] text-white hover:bg-[#4e7156] transition duration-200 ease-in-out
								transform"
					aria-label="Filter Options"
					title='search options'
				>
					<Sparkle className="w-5 h-5 text-white" />
				</button>
				<button
					className="ml-2 px-4 py-1 bg-[#344c39] text-white rounded-md font-medium hover:bg-[#4e7156]
								transition duration-150 ease-in-out"
					onClick={handleSearch}
				>
					Search
				</button>
			</div>

			{/* OPTION POPUP */}
			{showOptions && (
                <div ref={optionsRef} className="absolute top-16 left-1/4 right-52 bg-white min-w-[280px]
									shadow-lg p-4 z-50 rounded-lg max-h-[80vh] overflow-y-auto  max-w-[60vh] overflow-x-auto">
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
							<h2 className="text-sm font-medium text-gray-500">Popular Tags</h2>
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
											{tag.tag_name} ({tag.usage_count})
										</span>
									))
								) : (
									<p>No tags yet</p>
								)}
							</div>
						</div>
                        {/* Search for tags*/}
                        <div className="flex gap-2 mt-2">
                            <div className="mb-4">
                                <h2 className="text-sm font-medium text-gray-500">Search for Tags</h2>
                                <input
                                    type="text"
                                    value={searchTag}
									maxLength="255"
                                    onChange={(e) => {
                                        setSearchTag(e.target.value.toLowerCase());
                                        handleTagSearch(e.target.value.toLowerCase());
                                    }}
                                    placeholder="Type to search..."
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300
                                                rounded-md shadow-sm bg-gray-100 text-gray-900 focus:outline-none
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
                        </div>
                        {/* Selected tags*/}
                        <div className="mb-4">
							<h2 className="text-sm  font-medium text-gray-500">Your tags</h2>
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
                </div>
            )}
		</header>
	)
}

export default SearchBar;