import Navbar from './NavBar';
import Footer from './Footer';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const router = useRouter();
  const showLayout = router.pathname !== '/login' && router.pathname !== '/admin';

  return (
    <div className='flex flex-col min-h-screen'>
      {showLayout && <Navbar />}
      <main className='flex-grow'>{children}</main>
      {showLayout && <Footer />}
    </div>
  );
};

export default Layout;
