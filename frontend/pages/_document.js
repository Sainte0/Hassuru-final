import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/react"

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Hassuru - Ropa y Zapatillas de Marca</title>
        <meta name="description" content="Hassuru - Tu tienda online de ropa y zapatillas de marca. Encuentra las mejores ofertas en sneakers, ropa deportiva y accesorios. Envío gratis en Argentina." />
        <meta name="keywords" content="ropa, zapatillas, sneakers, marca, deportes, moda, Argentina, online, tienda" />
        <meta name="author" content="Hassuru" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Hassuru - Ropa y Zapatillas de Marca" />
        <meta property="og:description" content="Tu tienda online de ropa y zapatillas de marca. Encuentra las mejores ofertas en sneakers, ropa deportiva y accesorios." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hassuru.ar" />
        <meta property="og:image" content="https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images//static-1750482097221-banner-3-min.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hassuru - Ropa y Zapatillas de Marca" />
        <meta name="twitter:description" content="Tu tienda online de ropa y zapatillas de marca. Encuentra las mejores ofertas en sneakers, ropa deportiva y accesorios." />
        <meta name="twitter:image" content="https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images//static-1750482097221-banner-3-min.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Google tag (gtag.js) */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        {/* Fallback for missing insights script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent 404 errors for missing insights script
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.target && e.target.src && e.target.src.includes('insights/script.js')) {
                    e.preventDefault();
                    console.warn('Insights script not found, skipping...');
                  }
                }, true);
              }
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
