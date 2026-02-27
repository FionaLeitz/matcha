/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{html,js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				matcha: ['ZTMota', 'sans-serif'],
			  	lora: ['Lora-VariableFont_wght', 'serif'],
				montserrat: ['Montserrat', 'sans-serif'],
				playfair: ['PlayfairDisplay-VariableFont_wght', 'serif'],
				raleway: ['Raleway', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('daisyui'),
	],
}