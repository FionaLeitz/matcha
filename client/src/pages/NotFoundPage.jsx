import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
	return (
        <div className='min-h-screen flex flex-col'>
            <Header />
    		<div className='flex-grow flex justify-center items-center p-4'>
                <div className='bg-white p-8 rounded-lg shadow-md text-center'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-2'>404 - Page Not Found</h2>
                    <p className='text-gray-600'>Oops! It seems this page does't exist.</p>
                    <Link
                        to='/'
                        className='mt-6 px-4 py-2 bg-[#8ba888] hover:bg-[#789175] text-[#f5f3ee] rounded transition-colors 
                        focus:outline-none focus:ring-2 focus:ring-[#DFECCF] inline-block'
                    >
                        Go Back To Home
                    </Link>
                </div>
            </div>
 			<Footer />
 		</div>
	);
}
export default NotFoundPage;
