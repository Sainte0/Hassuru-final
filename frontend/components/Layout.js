import Navbar from './NavBar';
import Footer from './Footer';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const router = useRouter();
  const showLayout = router.pathname !== '/login' && router.pathname !== '/admin';

  return (
    <div className='flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300'>
      {showLayout && <Navbar />}
      {showLayout && (
        <div className="w-full bg-white dark:bg-gray-800 shadow-sm px-2 py-4 flex justify-center border-b border-gray-200 dark:border-gray-700">
          <div className="w-full max-w-2xl">
            <SearchBar isHamburgerOpen={false} />
          </div>
        </div>
      )}
      <main className='flex-1 flex flex-col'>{children}</main>
      {showLayout && <Footer />}
    </div>
  );
};

export default Layout;
