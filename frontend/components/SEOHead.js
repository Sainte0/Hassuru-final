import Head from 'next/head';

const SEOHead = ({ 
  title = "Hassuru - Ropa y Zapatillas de Marca",
  description = "Hassuru - Tu tienda online de ropa y zapatillas de marca. Encuentra las mejores ofertas en sneakers, ropa deportiva y accesorios. Envío gratis en Argentina.",
  keywords = "ropa, zapatillas, sneakers, marca, deportes, moda, Argentina, online, tienda",
  image = "https://tzjkxidzrhbyypvqbtdb.supabase.co/storage/v1/object/public/product-images//static-1750482097221-banner-3-min.png",
  url = "https://hassuru.ar",
  type = "website"
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Hassuru" />
      <meta property="og:locale" content="es_AR" />
      {type === "product" && (
        <meta property="og:type" content="product" />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="author" content="Hassuru" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SEOHead; 