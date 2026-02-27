import React, { useRef, useEffect } from 'react'
import Header from '../components/Header';
import MessageInput from '../components/MessageInput';
import Footer from '../components/Footer';
import { useAuthStore } from "../store/useAuthStore";
import { useMatchStore } from "../store/useMatchStore";
import { useMessageStore } from "../store/useMessageStore";
import { useParams, Link } from 'react-router-dom';
import { Loader, UserX } from "lucide-react";

const ChatPage = () => {
    const { messages, getMessages } = useMessageStore();
    const {authUser} = useAuthStore();
    const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();
    const { id } = useParams();
    const match = matches.find(match => match.id === Number(id));
	const messagesContainerRef = useRef(null);
	const scrollToEndRef = useRef(null);

	useEffect(() => {
		if (scrollToEndRef.current) {
			scrollToEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);
	
    useEffect(() => {
        if (authUser && id) {
            getMyMatches();
            getMessages(id);
        }
    }, [getMyMatches, authUser, getMessages, id]);

    if (isLoadingMyMatches)
		return <LoadingMessagesUI />;

    if (!match)
        return <MatchNotFound />;

	return (
		<div className='flex flex-col h-screen bg-[#F0F5EA] bg-opacity-100'>
			<Header />
			<div className='flex-grow flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden max-w-4xl mx-auto w-full'>
				<div className='flex items-center mb-4 bg-[#fdfdf4] rounded-lg shadow p-3'>
					<Link
						className='flex items-center'
						to={`/profile/${match.username}`}
					>
						<img
							src={match.image || "/avatar.webp"}
							className='w-12 h-12 object-cover rounded-full mr-3 border-2 border-[#4e7156]'
						/>
						<h2 className='text-xl font-semibold text-gray-800'>{match.username}</h2>
						</Link>
					</div>
				<div
					ref={messagesContainerRef}
					className='flex-grow overflow-y-auto mb-4 bg-[#fdfdf4] rounded-lg shadow p-4'
				>
					{messages.length === 0 ? (
						<p className='text-center text-gray-500 py-8'>Start your conversation with {match.username}</p>
					) : (
						messages.map((msg, index) => (
							<div
								key={index}
								className={`mb-3 ${msg.sender_id === authUser.id ? "text-right" : "text-left"}`}
							>
								<span
									className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md break-all ${
										msg.sender_id === authUser.id
											? "bg-gray-200 text-gray-800"
											: "bg-[#506b56] text-white"
											
									}`}
								>
									{msg.content}
								</span>
							</div>
						))
					)}
					<div ref={scrollToEndRef}/>
				</div>
				<MessageInput match={match} />
			</div>
			<Footer/>
		</div>
	);
};
export default ChatPage;


const MatchNotFound = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-gray-100 bg-opacity-50 bg-dot-pattern'>
		<div className='bg-white p-8 rounded-lg shadow-md text-center'>
			<UserX size={64} className='mx-auto text-[#44624a] mb-4' />
			<h2 className='text-2xl font-semibold text-gray-800 mb-2'>Match Not Found</h2>
			<p className='text-gray-600'>Oops! It seems this match doesn't exist or has been removed.</p>
			<Link
				to='/'
				className='mt-6 px-4 py-2  text-white rounded bg-[#8ba888] hover:bg-[#789175] transition-colors 
				focus:outline-none focus:ring-2 focus:ring-[#F0F5EA] inline-block'
			>
				Go Back To Home
			</Link>
		</div>
	</div>
);

const LoadingMessagesUI = () => (
	<div className='h-screen flex flex-col items-center justify-center bg-gray-100 bg-opacity-50'>
		<div className='bg-white p-8 rounded-lg shadow-md text-center'>
			<Loader size={48} className='mx-auto text-[#44624a] animate-spin mb-4' />
			<h2 className='text-2xl font-semibold text-gray-800 mb-2'>Loading Chat</h2>
			<p className='text-gray-600'>Please wait while we fetch your conversation...</p>
			<div className='mt-6 flex justify-center space-x-2'>
				<div
					className='w-3 h-3 bg-text-[#44624a] rounded-full animate-bounce'
					style={{ animationDelay: "0s" }}
				/>
				<div
					className='w-3 h-3 bg-text-[#44624a] rounded-full animate-bounce'
					style={{ animationDelay: "0.2s" }}
				/>
				<div
					className='w-3 h-3 bg-text-[#44624a] rounded-full animate-bounce'
					style={{ animationDelay: "0.4s" }}
				/>
			</div>
		</div>
	</div>
);