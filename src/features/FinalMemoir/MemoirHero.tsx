import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HeroPhoto } from "./types";

interface MemoirHeroProps {
  onOpenGallery: () => void;
  name?: string;  
  dates?: string; 
  description?: string;
  heroPhotos?: HeroPhoto[];
}

export default function MemoirHero({ 
  onOpenGallery, 
  name, 
  dates, 
  description, 
  heroPhotos = [] 
}: MemoirHeroProps) {
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [carouselFinished, setCarouselFinished] = useState(false);

  useEffect(() => {
    if (carouselFinished || isCarouselHovered || heroPhotos.length === 0) return;
    const timer = setInterval(() => {
      setHeroPhotoIndex(prev => {
        if (prev + 1 >= heroPhotos.length) {
          setCarouselFinished(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); 
    return () => clearInterval(timer);
  }, [carouselFinished, isCarouselHovered, heroPhotos.length]);

  return (
    <section className="pt-36 pb-8 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
      <div className="flex-1 text-left w-full md:max-w-lg">
        
        {/* Dynamic Name */}
        <h2 className="text-5xl md:text-6xl font-serif italic text-memory-maroon font-normal tracking-tight">
          {name || "Archive"}
        </h2>
        
        {/* Dynamic Description */}
        <p className="mt-5 text-xl md:text-2xl font-serif italic text-stone-700 leading-relaxed">
          {description || "Preserved memories and shared stories."}
        </p>
        
        <div className="flex items-center gap-4 mt-6">
          <div className="h-px w-8 bg-stone-300"></div>
          
          {/* Dynamic Dates */}
          <p className="text-sm font-serif uppercase tracking-[0.2em] text-stone-500">
            {dates || ""}
          </p>
        </div>
      </div>

      <div 
        className="w-full md:w-80 h-72 md:h-[340px] relative flex items-center justify-center shrink-0"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
      >
        {!carouselFinished && heroPhotos.length > 0 && (
          <div className="relative w-full h-full flex items-center justify-center">
            {heroPhotos.map((photo, idx) => (
              <div 
                key={photo.id}
                className={`absolute transition-opacity duration-500 ease-in-out ${idx === heroPhotoIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
              >
                <figure className="w-56 md:w-72 bg-white p-2.5 shadow-xl border border-stone-200">
                  <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                    <Image src={photo.url} alt={photo.caption || "Archive photo"} fill className="object-cover" />
                  </div>
                  {photo.caption && (
                    <figcaption className="pt-3 pb-1 text-[11px] md:text-[12px] font-serif italic text-stone-600 text-center leading-tight line-clamp-1">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              </div>
            ))}
          </div>
        )}

        {(carouselFinished || heroPhotos.length === 0) && heroPhotos.length > 0 && (
          <button 
            onClick={onOpenGallery}
            className="w-56 md:w-72 h-48 md:h-56 bg-white border border-stone-200 shadow-xl flex flex-col items-center justify-center gap-4 transition-colors duration-300 group cursor-pointer"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FAF9F6] border border-stone-200 flex items-center justify-center group-hover:bg-memory-maroon group-hover:text-white transition-colors text-stone-400">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="font-serif uppercase tracking-[0.2em] text-[11px] md:text-[12px] font-bold text-stone-600 group-hover:text-memory-maroon">
              View Photographic Archives
            </span>
          </button>
        )}
      </div>
    </section>
  );
}