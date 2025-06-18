import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Toaster } from 'react-hot-toast';
import { Roboto } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import CartDrawer from '../components/CartDrawer';
import { useCartStore } from '../store/cartStore';
import { useState } from 'react';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  const { cart } = useCartStore();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className={roboto.className}>
      <Toaster />
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Analytics />
      <button
        className="fixed bottom-6 right-6 bg-black text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 md:hidden "
        onClick={() => setOpen(true)}
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} cart={cart} onProceed={() => { setOpen(false); window.location.href = '/checkout'; }} />
    </div>
  )
}
