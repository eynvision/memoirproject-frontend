import { useEffect } from 'react'
import { Check } from 'lucide-react'

interface ToastProps {
  message: string
  onDismiss: () => void
  /** Milliseconds before the toast auto-dismisses. */
  duration?: number
}

/**
 * A quiet, bottom-anchored confirmation. Used for things like "Info saved" —
 * present enough to notice, gone before it asks for attention.
 */
export default function Toast({ message, onDismiss, duration = 2200 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [onDismiss, duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-6"
    >
      <div className="pointer-events-auto flex animate-toastIn items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-cream shadow-soft">
        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-cream/15">
          <Check className="h-3 w-3" strokeWidth={2.5} />
        </span>
        <span className="font-body text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
