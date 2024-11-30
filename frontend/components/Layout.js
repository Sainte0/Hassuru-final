import Navbar from './NavBar';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { FaWhatsapp } from 'react-icons/fa'

const Layout = ({ children }) => {
  const router = useRouter();
  const showLayout = router.pathname !== '/login' && router.pathname !== '/admin';
  const whatsappNumber = "3512591212"

  return (
    <div className='flex flex-col min-h-screen'>
      {showLayout && <Navbar />}
      <main className='flex-grow'>{children}</main>
      {showLayout &&
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 p-3 text-white bg-green-500 rounded-full shadow-lg bottom-5 right-5"
      >
        <FaWhatsapp size={32} />
      </a>
      }
      {showLayout && <Footer />}
    </div>
  );
};

export default Layout;
