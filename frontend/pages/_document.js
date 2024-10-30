import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Hassuru</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
