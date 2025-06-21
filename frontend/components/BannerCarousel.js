import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const BannerCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg mb-8">
      {/* Banner Container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {banner.link ? (
              <a href={banner.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if there are multiple banners */}
      {banners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Banner anterior"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Banner siguiente"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if there are multiple banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir al banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel; 