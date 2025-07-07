import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/react"

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LY403MC5HZ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LY403MC5HZ');
            `,
          }}
        />
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
