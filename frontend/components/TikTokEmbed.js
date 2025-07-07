import React, { useState, useEffect } from 'react';

const TikTokEmbed = ({ link, index }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Lazy load TikTok embeds
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const container = document.getElementById(`tiktok-${index}`);
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, [index]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.warn('TikTok embed failed to load:', link);
  };

  if (hasError) {
    return (
      <div className="w-full aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-gray-700 dark:text-gray-200 text-sm mb-2">
            No se pudo cargar el contenido
          </div>
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs underline"
          >
            Ver en TikTok
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`tiktok-${index}`}
      className="w-full aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 z-10">
          <div className="text-gray-700 dark:text-gray-200 text-sm">Cargando...</div>
        </div>
      )}
      
      {isVisible && (
        <iframe
          src={link}
          width="100%"
          height="100%"
          style={{
            border: "none",
            backgroundColor: "transparent",
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; accelerometer; gyroscope;"
          allowFullScreen
          className="bg-transparent w-full h-full"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          title={`TikTok embed ${index + 1}`}
        />
      )}
    </div>
  );
};

export default TikTokEmbed; 