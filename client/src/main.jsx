import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { BrowserRouter } from "react-router-dom";

if (import.meta.env.VITE_USER_NODE_ENV === "development")
	console.warn = () => {};
	
createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
)
