export default function CallToAction() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center bg-[#faf8f5] px-8 py-32 text-center border-t border-[#381c24]/10">
      <div className="max-w-2xl mx-auto flex flex-col items-center">

        {/* Subtle Gold Accent Line */}
        <div className="w-12 h-[2px] bg-[#c9a063] mb-8"></div>

        <h2 className="text-[#381c24] text-3xl md:text-4xl font-serif mb-4 leading-tight">
          Ready to preserve their legacy?
        </h2>

        <p className="text-[#381c24]/70 text-base md:text-lg mb-10 font-sans font-light">
          Start building the archive for just <span className="font-semibold text-[#381c24]">$3/month</span>.
        </p>

        <button className="bg-[#4a222a] text-[#faf8f5] text-base md:text-lg font-sans font-medium px-8 py-3.5 rounded-xl hover:bg-[#381c24] hover:shadow-xl hover:shadow-[#4a222a]/20 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center border border-[#4a222a]">
          <span>Begin Their Story</span>
        </button>

      </div>
    </section>
  );
}