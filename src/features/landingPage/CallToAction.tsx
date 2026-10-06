import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center bg-memory-bg px-8 py-32 text-center border-t border-memory-primary/10">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-12 h-05 bg-memory-accent mb-8"></div>

        <h2 className="text-memory-primary text-3xl md:text-4xl font-serif mb-4 leading-tight">
          Ready to preserve their legacy?
        </h2>

        <p className="text-memory-primary/70 text-base md:text-lg mb-10 font-sans font-light">
          Start building the archive for just{" "}
          <span className="font-semibold text-memory-primary">$3/month</span>.
        </p>

        <Link
          href="/memory-subject-selection"
          className="bg-memory-maroon text-memory-bg text-base md:text-lg font-sans font-medium px-8 py-3.5 rounded-xl hover:bg-memory-primary hover:shadow-xl hover:shadow-memory-maroon/20 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center border border-memory-maroon"
        >
          Begin Their Story
        </Link>
      </div>
    </section>
  );
}