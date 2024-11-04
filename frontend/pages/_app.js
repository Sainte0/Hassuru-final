import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Toaster } from 'react-hot-toast';
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
});
export default function App({ Component, pageProps }) {
  return(
  <div className={roboto.className}>
    <Toaster />
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </div>
  )
}
