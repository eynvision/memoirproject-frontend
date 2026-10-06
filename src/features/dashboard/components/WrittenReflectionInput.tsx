"use client";


interface WrittenReflectionInputProps {
  activeInput: "text" | "combined" | string;
  isTextExpanded: boolean;
  setIsTextExpanded: (val: boolean) => void;
  inputContent: string;
  setInputContent: (val: string) => void;
}

export function WrittenReflectionInput({
  activeInput,
  isTextExpanded,
  setIsTextExpanded,
  inputContent,
  setInputContent,
}: WrittenReflectionInputProps) {
  if (activeInput !== "text" && activeInput !== "combined") return null;

  return (
    <div>
      {isTextExpanded ? (
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder={activeInput === "combined" ? "Add reflection text..." : "Write your story here with care..."}
          rows={6}
          autoFocus
          className="w-full bg-stone-50/50 text-stone-800 font-sans text-[16px] leading-relaxed placeholder:text-stone-400 border border-stone-300 p-5 rounded-xl outline-none focus:border-memory-primary resize-none book-text mt-2"
        />
      ) : (
        <div 
          onClick={(e) => { e.stopPropagation(); setIsTextExpanded(true); }}
          className="py-2 text-stone-400 font-sans text-[16px] font-medium select-none truncate cursor-pointer hover:text-stone-600 transition-colors"
        >
          {inputContent ? inputContent : "Click here to expand and write freely..."}
        </div>
      )}
    </div>
  );
}