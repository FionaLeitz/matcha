import React from 'react'
import { useMatchStore } from '../store/useMatchStore';

const getFeedbackStyle = (swipeFeedback) => {
	if (swipeFeedback === "liked")
		return ("text-[#44624a]");
	if (swipeFeedback === "passed" || swipeFeedback === "unauthorized")
		return ("text-red-500");
	if (swipeFeedback === "matched")
		return ("text-[#44624a]");
	return ;
}

const getFeedbackText = (swipeFeedback) => {
	if (swipeFeedback === "liked")
		return ("Liked!");
	if (swipeFeedback === "passed")
		return ("Passed");
	if (swipeFeedback === "matched")
		return ("It's a Match!");
	if (swipeFeedback === "unauthorized")
		return ("You need a profile picture to like other profiles")
	return ;
}

const SwipeFeedback = () => {
	const { swipeFeedback } = useMatchStore();

	return (
		<div className={`
			absolute top-10 left-0 right-0 text-center text-2xl font-bold ${getFeedbackStyle(swipeFeedback)}
		`}>
			{getFeedbackText(swipeFeedback)}

		</div>
	)
}

export default SwipeFeedback