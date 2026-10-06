// cspell:disable

import Image from "next/image";
import { HeroPhoto } from "./types";


interface ScatteredGalleryProps {
  heroPhotos: HeroPhoto[];
  onClose: () => void;
}

const scatterPositions = [
  { top: "5%", left: "5%", rotate: "-6deg" },
  { top: "10%", left: "80%", rotate: "3deg" },
  { top: "35%", left: "2%", rotate: "6deg" },
  { top: "40%", left: "75%", rotate: "-3deg" },
  { top: "75%", left: "6%", rotate: "-12deg" },
  { top: "80%", left: "80%", rotate: "12deg" },
  { top: "2%", left: "40%", rotate: "2deg" },
  { top: "85%", left: "45%", rotate: "-2deg" },
  { top: "60%", left: "15%", rotate: "3deg" },
  { top: "65%", left: "70%", rotate: "-6deg" },
  { top: 
    "25%", left: "25%", rotate: "1deg" },
  { top: "70%", left: "70%", rotate: "-1deg" },
];

export default function ScatteredGallery({ heroPhotos, onClose }: ScatteredGalleryProps) {
  return (
    <div className="fixed inset-0 z-100 bg-[#FAF9F6] overflow-hidden flex items-center justify-center animate-fadeIn">
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 md:top-12 md:right-12 z-50 w-12 h-12 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-500 hover:text-memory-maroon hover:scale-105 transition-all cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div className="absolute top-12 left-12 z-40 hidden md:block">
        <h2 className="text-4xl font-serif italic text-memory-maroon">The Archives</h2>
        <p className="text-sm font-serif uppercase tracking-[0.2em] text-stone-500 mt-2">Nadias Photographic Plates</p>
      </div>

      <div className="relative w-full h-full max-w-7xl mx-auto p-12 mt-12">
        {heroPhotos.map((photo, idx) => {
          const pos = scatterPositions[idx % scatterPositions.length];
          return (
            <div 
              key={photo.id}
              className="absolute transition-transform duration-500 hover:scale-110 hover:z-50 cursor-pointer"
              style={{
                top: pos.top,
                left: pos.left,
                transform: `rotate(${pos.rotate})`,
              }}
            >
              <figure className="w-48 md:w-64 bg-white p-2.5 shadow-xl border border-stone-200">
                <div className="relative w-full aspect-4/3 bg-stone-100 overflow-hidden">
                  <Image src={photo.url} alt={photo.caption || "Archive photo"} fill className="object-cover" />
                </div>
                {photo.caption && (
                  <figcaption className="pt-2.5 pb-1 text-[10px] md:text-[11px] font-serif italic text-stone-600 text-center leading-tight">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            </div>
          );
        })}
      </div>
    </div>
  );
}