"use client";

interface HeaderTitleSectionProps {
  name: string;
  setName: (name: string) => void;
  dates: string;
  setDates: (dates: string) => void;
}

export function HeaderTitleSection({ name, setName, dates, setDates }: HeaderTitleSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-transparent font-sans text-2xl text-memory-primary font-bold tracking-tight placeholder:text-stone-400 border-none outline-none focus:ring-0 p-0 w-40"
      />
      <span className="text-stone-600 font-bold">/</span>
      <input
        type="text"
        value={dates}
        onChange={(e) => setDates(e.target.value)}
        className="bg-transparent text-xs font-sans uppercase tracking-[0.15em] text-stone-800 font-bold placeholder:text-stone-400 border-none outline-none focus:ring-0 p-0 w-28"
      />
    </div>
  );
}