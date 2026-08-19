import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, BookOpen, Check, Minus, Sparkles, LayoutGrid, Equal, Plus, Folder, SlidersHorizontal, Brain } from 'lucide-react'
import Button from '../components/Button'
import FlowHeader from '../components/FlowHeader'
import Toast from '../components/Toast'
import { useMemoirSubject } from '../context/MemoirContext'
import type { TimeCommitment } from '../types'

interface PaceOption {
  id: TimeCommitment
  icon: typeof Timer
  title: string
  points: { icon: typeof Minus; label: string }[]
}

const OPTIONS: PaceOption[] = [
  {
    id: 'light',
    icon: Timer,
    title: '5 minutes a week',
    points: [
      { icon: Minus, label: 'Fewer questions' },
      { icon: Sparkles, label: 'AI-powered organization' },
      { icon: LayoutGrid, label: 'Simpler interface' },
      { icon: Equal, label: 'Shorter prompts' },
    ],
  },
  {
    id: 'deep',
    icon: BookOpen,
    title: '30+ minutes a week',
    points: [
      { icon: Plus, label: 'Richer prompts' },
      { icon: Folder, label: 'Detailed organization' },
      { icon: SlidersHorizontal, label: 'More customization' },
      { icon: Brain, label: 'Frequent reflection questions' },
    ],
  },
]

export default function PacePage() {
  const navigate = useNavigate()
  const { subject, updateSubject } = useMemoirSubject()
  const [selected, setSelected] = useState<TimeCommitment | null>(subject.timeCommitment)
  const [showToast, setShowToast] = useState(false)

  const handleSelect = (id: TimeCommitment) => {
    setSelected(id)
    updateSubject({ timeCommitment: id })
    setShowToast(true)
  }

  const proceed = () => {
    // eslint-disable-next-line no-console
    console.log('Pace step complete. Subject:', { ...subject, timeCommitment: selected })
    navigate('/begin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <FlowHeader backTo="/dashboard" closeTo="/dashboard" />

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-4 sm:pt-10">
        <div className="w-full max-w-3xl animate-fadeIn text-center">
          <h1 className="text-balance font-display text-[30px] font-medium leading-tight text-ink sm:text-[38px]">
            How much time would you like to dedicate to your memoir?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-ink/60">
            We&apos;ll tailor your experience—from prompts to organization—to fit your life.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {OPTIONS.map((option) => {
              const isSelected = selected === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  aria-pressed={isSelected}
                  className={`group relative flex flex-col rounded-3xl border p-7 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-clay-500 bg-clay-50 shadow-card'
                      : 'border-ink/10 bg-white/60 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-clay-500 text-cream">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                    </span>
                  )}

                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isSelected ? 'bg-clay-100 text-clay-600' : 'bg-ink/[0.05] text-ink/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>

                  <p className="mt-6 font-display text-2xl text-ink">{option.title}</p>

                  <ul className="mt-5 space-y-3">
                    {option.points.map(({ icon: PointIcon, label }) => (
                      <li key={label} className="flex items-center gap-2.5 text-[15px] text-ink/70">
                        <PointIcon className="h-4 w-4 flex-none text-ink/40" strokeWidth={1.75} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <div className="mx-auto mt-11 flex max-w-sm flex-col gap-3">
            <Button variant="primary" disabled={!selected} onClick={proceed} className="w-full">
              Continue
            </Button>
            <Button variant="secondary" onClick={proceed} className="w-full">
              Skip
            </Button>
          </div>
        </div>
      </main>

      {showToast && <Toast message="Info saved" onDismiss={() => setShowToast(false)} />}
    </div>
  )
}
