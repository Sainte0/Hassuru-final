import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/react"

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
