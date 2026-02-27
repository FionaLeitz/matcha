import { Navigate, Outlet } from 'react-router-dom';
import { axiosInstance } from './lib/axios';

const PrivateRoute = ({isAuthentified, isVerified}) => {
    if (!isAuthentified) {
        return <Navigate to="/auth" />;
    }

    if (!isVerified) {
        return <Navigate to="/confirm" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
