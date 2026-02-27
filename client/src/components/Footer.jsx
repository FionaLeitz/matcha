import React from 'react';
import { Flame } from 'lucide-react';

const Footer = () => {

	return (
		<div className='mt-4'>
			<footer className="bg-[#DFECCF] text-[#344c39] py-4">
				<div className="flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto px-4">
					<div className="flex items-center space-x-2">
						<div className='w-8 h-8'>
							<img src="/matchalogo3.svg"/>
						</div>
						{/* <Flame className="w-8 h-8 text-[#344c39]" /> */}
						<span className="text-2xl font-matcha font-bold hidden sm:inline">Matcha</span>
					</div>
					<p className="text-center mt-2 sm:mx-2 sm:mt-0 text-sm sm:text-base">
						Find your perfect match with one simple swipe.
					</p>
					<p className="text-center mt-2 sm:mt-0 text-sm sm:text-base">
						Made by <span className="font-semibold">Cmeston</span> and <span className="font-semibold">Fleitz</span>
					</p>
				</div>
			</footer>
		</div>
	)
}

export default Footer;