import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'

interface FlowHeaderProps {
  /** Where "back" should go. Defaults to browser history. */
  backTo?: string
  /** Where the close (×) control should go. Defaults to the landing dashboard. */
  closeTo?: string
  /** Use the clay accent color for the back arrow, matching the sign-up screen. */
  accentBack?: boolean
}

export default function FlowHeader({ backTo, closeTo = '/dashboard', accentBack = false }: FlowHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-10">
      <button
        type="button"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        aria-label="Go back"
        className={`rounded-full p-2 transition hover:bg-ink/5 ${
          accentBack ? 'text-clay-600 hover:text-clay-700' : 'text-ink/80 hover:text-ink'
        }`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => navigate(closeTo)}
        aria-label="Close"
        className="rounded-full p-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
      >
        <X className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </header>
  )
}
