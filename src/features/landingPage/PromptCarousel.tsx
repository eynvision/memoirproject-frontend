"use client";
import { motion } from "framer-motion";

const prompts = [
  "What is your earliest memory of him?",
  "What did he do that nobody else did?",
  "What is a phrase they always used to say?",
  "What was the most rebellious thing you did in your twenties?",
  "If you could relive one completely ordinary day together, which would it be?",
  "What is a quiet, everyday habit of theirs that you absolutely love?",
  "Is there a specific song, smell, or meal that instantly brings them to mind?",
  "What is the best piece of advice they ever gave you, even if you didn't realize it then?",
  "What is a story about their own childhood that always amazed you?"
];

export default function PromptCarousel() {
    return (
        <section className="py-32 md:py-44 flex flex-col items-center justify-center bg-[#faf8f5] overflow-hidden">

            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[#381c24] text-3xl md:text-4xl mb-12 font-serif text-center px-4"
            >
                Find just the right <span className="text-[#c9a063] italic">questions to ask</span>
            </motion.h3>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-6 overflow-x-auto w-full max-w-6xl px-8 pb-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {prompts.map((question, index) => (
                    <div 
                        key={index}
                        className="w-[280px] h-[200px] md:w-[340px] md:h-[240px] bg-[#fdf8ed] p-8 rounded-2xl border border-[#f0e4d3] snap-center shrink-0 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-center items-start text-left"
                    >
                        <p className="text-[#381c24] text-base md:text-lg font-serif italic leading-relaxed">
                            "{question}"
                        </p>
                    </div>
                ))}

            </div>
        </section>
    );
}