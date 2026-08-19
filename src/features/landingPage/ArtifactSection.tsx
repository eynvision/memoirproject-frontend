"use client";
import { motion } from "framer-motion";

const artifactCards = [
  {
    title: "The Living Archive",
    description: "A beautiful, interactive digital space where family members can continually read stories and leave comments.",
    bg: "bg-[#faf8f5]",
    border: "border-2 border-[#381c24]/20 hover:border-[#c9a063] hover:shadow-[#381c24]/40",
    prototypeBg: "bg-[#381c24]/5",
    mockup: (
      <motion.div 
        variants={{ hover: { y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } } }}
        className="w-full max-w-[240px] bg-white rounded-t-lg rounded-b-md shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Browser Header */}
        <div className="bg-gray-100 h-5 w-full flex items-center px-2 gap-1.5 border-b border-gray-200">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        
        {/* Web Page Content */}
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-[#c9a063]/20 flex items-center justify-center">
                  <span className="text-[#c9a063] font-serif text-[10px] font-bold">DK</span>
               </div>
               <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-2 mb-4">
               <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
               <div className="h-1.5 w-[90%] bg-gray-100 rounded-full"></div>
               <div className="h-1.5 w-[60%] bg-gray-100 rounded-full"></div>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-gray-50">
               <motion.div variants={{ hover: { scale: 1.2, color: "#ef4444" } }} className="text-gray-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </motion.div>
               <motion.div variants={{ hover: { scale: 1.1, color: "#381c24" } }} className="text-gray-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               </motion.div>
            </div>
        </div>
      </motion.div>
    ),
  },
  {
    title: "The Fixed Artifact",
    description: "A beautifully formatted, downloadable PDF designed to be printed, bound, and kept forever.",
    bg: "bg-[#fdf8ed]",
    border: "border-2 border-[#f0e4d3] hover:border-[#c9a063] hover:shadow-[#c9a063]/20",
    prototypeBg: "bg-[#c9a063]/10",
    mockup: (
      <>
        <motion.div 
          variants={{ hover: { x: -8, y: -4, rotate: -3 } }}
          className="absolute w-3/5 h-36 bg-[#faf8f5] border border-[#e5d9c5] shadow-sm"
        />
        <motion.div 
          variants={{ hover: { x: 8, y: -8, rotate: 2, scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 20 } } }}
          className="relative z-10 w-3/5 h-36 bg-[#faf8f5] border border-[#e5d9c5] shadow-md p-4 flex flex-col items-center"
        >
           <div className="h-1.5 w-12 bg-[#381c24] mb-4"></div>
           <div className="flex gap-3 w-full h-full">
              <div className="flex-1 space-y-1.5 mt-1">
                 <div className="h-[2px] w-full bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-[90%] bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-[95%] bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-[80%] bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-full bg-[#381c24]/40"></div>
              </div>
              <div className="flex-1 space-y-1.5">
                 <div className="float-left w-3 h-3 bg-[#c9a063] mr-1 mb-1"></div>
                 <div className="h-[2px] w-full bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-[85%] bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-full bg-[#381c24]/40"></div>
                 <div className="h-[2px] w-[90%] bg-[#381c24]/40"></div>
              </div>
           </div>
        </motion.div>
      </>
    ),
  },
];

export default function ArtifactSection() {
  return (
    <section className="py-32 md:py-44 flex flex-col items-center justify-center bg-[#4a222a] p-8 overflow-hidden">
      
      {/* Refined Heading */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h3 className="text-[#fefaf1] text-3xl md:text-4xl font-serif mb-4">
          A Living Archive <span className="text-[#c9a063] italic">&</span> A Lasting Artifact
        </h3>
        <p className="text-[#fefaf1]/70 font-sans text-sm uppercase tracking-[0.2em]">
          Two ways to preserve the story
        </p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full">
        {artifactCards.map((card, index) => (
          <motion.div 
            key={index}
            whileHover="hover"
            className={`group flex-1 ${card.bg} p-10 rounded-3xl ${card.border} shadow-2xl flex flex-col items-center text-center cursor-pointer overflow-hidden transition-all duration-500`}
          >
            {/* Prototype Doodle Container */}
            <div className={`w-full h-48 mb-8 ${card.prototypeBg} rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden`}>
               {card.mockup}
            </div>

            <h4 className="text-[#381c24] text-2xl mb-3 font-serif group-hover:text-[#c9a063] transition-colors">
              {card.title}
            </h4>
            <p className="text-[#381c24]/70 text-sm leading-relaxed">
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}