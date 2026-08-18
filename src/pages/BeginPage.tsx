import { Sparkles } from 'lucide-react'
import { useMemoirSubject } from '../context/MemoirContext'

export default function BeginPage() {
  const { subject } = useMemoirSubject()

  const handleBegin = () => {
    // No workspace screen exists yet — this is where memory capture would start.
    // eslint-disable-next-line no-console
    console.log('Begin clicked. Subject so far:', subject)
  }

  const handleSkip = () => {
    // eslint-disable-next-line no-console
    console.log('Skip clicked from Begin screen. Subject so far:', subject)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-lg animate-fadeIn text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clay-50 shadow-card">
          <Sparkles className="h-6 w-6 animate-sparkle text-clay-500" strokeWidth={1.75} />
        </span>

        <h1 className="mt-8 text-balance font-display text-[32px] font-semibold leading-[1.2] text-ink sm:text-[40px]">
          Let&apos;s begin a memoir for
          <br className="hidden sm:block" /> someone you love.
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-[17px] leading-relaxed text-ink/60">
          We&apos;ll help you create a space for your family&apos;s memories, stories,
          photographs, and voices.
        </p>

        <div className="mx-auto mt-10 flex max-w-xs flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleBegin}
            className="w-full rounded-full bg-clay-500 px-8 py-3.5 font-body font-medium text-cream shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-clay-600 hover:shadow-soft active:translate-y-0 active:bg-clay-700"
          >
            Begin
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="font-body text-[15px] text-ink/55 transition hover:text-ink/80"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
