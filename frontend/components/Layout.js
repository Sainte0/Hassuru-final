import Navbar from './NavBar';
import Footer from './Footer';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const router = useRouter();
  const showLayout = router.pathname !== '/login' && router.pathname !== '/admin';

  return (
    <div className='flex flex-col min-h-screen'>
      {showLayout && <Navbar />}
      {showLayout && (
        <div className="w-full bg-white shadow-sm px-2 py-4 flex justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar isHamburgerOpen={false} />
          </div>
        </div>
      )}
      <main className='flex-grow'>{children}</main>
      {showLayout && <Footer />}
    </div>
  );
};

export default Layout;
