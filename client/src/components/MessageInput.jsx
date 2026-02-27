import React, { useRef, useState, useEffect } from 'react';
import { useMessageStore } from '../store/useMessageStore';
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({match}) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const { sendMessage } = useMessageStore();

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(match.id, message);
            setMessage('');
        }
    }

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
	}, []);


	return (
			<form onSubmit={handleSendMessage} className= 'flex relative'>
                <button
                type='button'
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:bg-[#789175] focus:outline-none'
                >
                    <Smile size={24} />
                </button>

                <input
				type='text'
				value={message}
				maxLength="255"
				onChange={(e) => setMessage(e.target.value)}
				className='flex-grow p-3 pl-12 rounded-l-lg bg-[#fdfdf4] border-2 border-[#4e71563b] 
							focus:outline-none focus:ring-1 focus:ring-[#4e71563b] text-gray-700 placeholder-gray-500'
				placeholder='Type a message...'
			/>
                <button
				type='submit'
				className='text-white p-3 rounded-r-lg 
						bg-[#8ba888] hover:bg-[#789175] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F0F5EA]'
			>
				    <Send size={24} />
			    </button>
                {showEmojiPicker && (
				<div ref={emojiPickerRef} className='absolute bottom-20 left-4'>
					<EmojiPicker
						onEmojiClick={(emojiObject) => {
							setMessage((prevMessage) => prevMessage + emojiObject.emoji);
						}}
					/>
				</div>
			)}
            </form>
	);
};

export default MessageInput;