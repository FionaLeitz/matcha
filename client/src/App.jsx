import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import SearchPage from "./pages/SearchPage";
import MyProfilePage from "./pages/MyProfilePage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import ConfirmPage from "./pages/ConfirmPage";
import VerifPage from "./pages/VerifPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from 'react';
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./privateRoutes";
import AskToResetPassword from "./pages/AskToResetPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetEmail from "./pages/ResetEmail";
import NotFoundPage from "./pages/NotFoundPage";


function App() {
	const { checkAuth, authUser, checkingAuth, isAuthentified, isVerified } = useAuthStore()
	const location = useLocation();

	useEffect(() => {
		checkAuth();
	}, [checkAuth, location.pathname]);

	if (checkingAuth) return null;

	return (
		<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" >
			
			<Routes>
				<Route path="/confirm" element={isAuthentified ? <ConfirmPage/> : <Navigate to={"/auth"} />} />
				<Route path="/auth" element={isAuthentified && isVerified ? <Navigate to={"/"} /> :  <AuthPage /> } />
				<Route path="/forgot-password" element={<AskToResetPassword/>} />
				<Route path="/verif" element={<VerifPage/>} />
				<Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
				<Route element={<PrivateRoute isVerified={isVerified} isAuthentified={isAuthentified} />}>
					<Route path="/" element={<HomePage/>} />
					<Route path="/search" element={<SearchPage/>} />
					<Route path="/myProfile/" element={<MyProfilePage/>} />
					<Route path="/profile/:username" element={<ProfilePage/>} />
					<Route path="/chat/:id" element={<ChatPage/>} />
					<Route path="/reset-email/:token" element={<ResetEmail/>} />
				</Route>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
			<Toaster />
		</div>
	)
}

export default App
