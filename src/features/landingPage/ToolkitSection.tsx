"use client";
import { motion } from "framer-motion";

const toolkitCards = [
  {
    title: "No App Required",
    description: "Skip the registration phase entirely. A secure link drops family members straight into the active archive immediately.",
    bg: "bg-[#faf8f5]",
    border: "border-2 border-[#381c24]/20 hover:border-[#c9a063] hover:shadow-[#381c24]/40",
    prototypeBg: "bg-[#381c24]/5 border-[#381c24]/10",
    mockup: (
      <motion.div 
        variants={{
          hover: { y: -15, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }
        }}
        className="bg-white border border-gray-100 text-[#381c24] text-[13px] px-4 py-3 rounded-2xl rounded-br-sm shadow-md max-w-[90%] text-left"
      >
        <p className="opacity-95 mb-3 leading-snug font-medium">We are collecting memories for Dad's 60th.</p>
        <div className="bg-[#381c24] rounded-lg p-2 border border-[#381c24] flex items-center gap-3 transition-colors duration-300 group-hover:border-[#c9a063] group-hover:bg-[#4a222a]">
           <div className="w-6 h-6 bg-[#faf8f5] rounded-full flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-[#c9a063]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
           </div>
           <span className="font-semibold tracking-wide text-xs text-[#faf8f5]">Join the archive</span>
        </div>
      </motion.div>
    ),
  },
  {
    title: "Voice or Text",
    description: "Share memories however you feel most comfortable, right in the browser.",
    bg: "bg-[#fdf8ed]",
    border: "border-2 border-[#f0e4d3] hover:border-[#c9a063] hover:shadow-[#c9a063]/20",
    prototypeBg: "bg-[#c9a063]/10 border-[#c9a063]/20 gap-3",
    mockup: (
      <>
        <motion.div 
          variants={{
            hover: { y: -2, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }
          }}
          className="w-full bg-[#381c24] rounded-xl p-3 border border-[#381c24] flex items-center justify-between shadow-lg group-hover:border-[#c9a063] transition-colors"
        >
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500 group-hover:animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
               <span className="text-xs text-[#faf8f5]/70 font-mono group-hover:text-[#faf8f5] transition-colors duration-300">02:14</span>
             </div>
             
             <div className="flex items-center gap-[3px]">
               <motion.div variants={{ hover: { scaleY: [1, 1.8, 0.8, 1], transition: { repeat: Infinity, duration: 0.8 } } }} className="w-1 h-3 bg-[#c9a063] rounded-full origin-center"></motion.div>
               <motion.div variants={{ hover: { scaleY: [1, 2.5, 1.2, 1], transition: { repeat: Infinity, duration: 0.9 } } }} className="w-1.5 h-5 bg-[#c9a063] rounded-full origin-center"></motion.div>
               <motion.div variants={{ hover: { scaleY: [1, 1.5, 0.5, 1], transition: { repeat: Infinity, duration: 0.7 } } }} className="w-1 h-2 bg-[#c9a063] rounded-full origin-center"></motion.div>
               <motion.div variants={{ hover: { scaleY: [1, 2, 0.9, 1], transition: { repeat: Infinity, duration: 0.85 } } }} className="w-1.5 h-4 bg-[#c9a063] rounded-full origin-center"></motion.div>
               <motion.div variants={{ hover: { scaleY: [1, 1.4, 0.7, 1], transition: { repeat: Infinity, duration: 0.75 } } }} className="w-1 h-3 bg-[#c9a063] rounded-full origin-center"></motion.div>
             </div>
        </motion.div>

        <motion.div 
          variants={{
            hover: { y: 2, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }
          }}
          className="w-full bg-white rounded-xl p-3 border border-[#f0e4d3] flex items-center justify-between shadow-sm group-hover:border-[#c9a063]/50 transition-colors"
        >
             <div className="flex flex-col items-start gap-1">
               <span className="text-[10px] text-[#c9a063] uppercase tracking-wider font-bold">Text Mode</span>
               <span className="text-xs text-[#381c24]/60 italic font-serif group-hover:text-[#381c24] transition-colors">"I still remember..."</span>
             </div>
             <div className="w-6 h-6 rounded-full bg-[#fdf8ed] border border-[#f0e4d3] flex items-center justify-center group-hover:bg-[#c9a063] transition-colors duration-300">
               <svg className="w-3 h-3 text-[#381c24] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
             </div>
        </motion.div>
      </>
    ),
  },
  {
    title: "Curated Prompts",
    description: "Meaningful, relationship-based questions to eliminate the blank page.",
    bg: "bg-[#faf8f5]",
    border: "border-2 border-[#381c24]/20 hover:border-[#c9a063] hover:shadow-[#381c24]/40",
    prototypeBg: "bg-[#381c24]/5 border-[#381c24]/10",
    mockup: (
      <>
        <motion.div 
          variants={{
            hover: { y: -12, rotate: -6, scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 25 } }
          }}
          className="absolute bg-white/60 border border-[#381c24]/10 w-[80%] h-24 rounded-xl shadow-sm z-0"
        />
        <motion.div 
          variants={{
            hover: { y: -4, rotate: 3, scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 25 } }
          }}
          className="relative z-10 bg-white border border-[#381c24]/15 p-4 rounded-xl shadow-md w-[90%] text-left flex flex-col gap-3 group-hover:border-[#c9a063]/50 transition-colors"
        >
             <div className="flex items-center justify-between">
               <span className="text-[10px] text-[#c9a063] uppercase tracking-wider font-bold">Prompt 14</span>
               <svg className="w-4 h-4 text-[#381c24]/30 group-hover:text-[#c9a063] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
             </div>
             <p className="text-[#381c24] text-[13px] font-serif italic leading-snug">
               "What was the most rebellious thing you did in your twenties?"
             </p>
        </motion.div>
      </>
    ),
  },
];

export default function ToolkitSection() {
  return (
   <section className="py-32 md:py-44 flex flex-col items-center justify-center bg-gradient-to-b from-[#381c24] to-[#12070b] p-8 md:p-16 overflow-hidden">
      
      <div className="text-center mb-20">
         <motion.h3 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-[#fefaf1] text-3xl md:text-4xl font-serif mb-4"
         >
           Capture Memories <span className="text-[#c9a063] italic">Without Friction</span>
         </motion.h3>
         <p className="text-[#fefaf1]/70 max-w-2xl mx-auto font-sans text-xs md:text-sm uppercase tracking-[0.3em]">
           The Technology Gets Out of the Way
         </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {toolkitCards.map((card, index) => (
          <motion.div 
            key={index}
            whileHover="hover"
            className={`group relative ${card.bg} p-8 rounded-3xl ${card.border} text-center flex flex-col items-center cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl`}
          >
             <div className={`w-full h-44 mb-8 ${card.prototypeBg} rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border`}>
               {card.mockup}
             </div>

             <h4 className="text-[#381c24] text-2xl mb-3 font-serif transition-colors duration-300 group-hover:text-[#c9a063]">
               {card.title}
             </h4>
             <p className="text-[#381c24]/70 leading-relaxed text-sm transition-colors duration-300 group-hover:text-[#381c24]">
               {card.description}
             </p>
          </motion.div>
        ))}
      </div>
   </section>
  );
}