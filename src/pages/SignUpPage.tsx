import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import FlowHeader from '../components/FlowHeader'
import { useMemoirSubject } from '../context/MemoirContext'

interface FormState {
  fullName: string
  email: string
  password: string
  termsAccepted: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getPasswordStrength(password: string): { label: string; className: string; width: string } | null {
  if (!password) return null
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const varietyScore = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length

  if (password.length < 8) {
    return { label: 'Too short', className: 'bg-red-400 text-red-600', width: 'w-1/4' }
  }
  if (password.length >= 12 && varietyScore >= 3) {
    return { label: 'Strong', className: 'bg-green-500 text-green-700', width: 'w-full' }
  }
  if (password.length >= 8 && varietyScore >= 2) {
    return { label: 'Medium', className: 'bg-gold-400 text-clay-700', width: 'w-2/3' }
  }
  return { label: 'Weak', className: 'bg-clay-300 text-clay-700', width: 'w-1/3' }
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { subject } = useMemoirSubject()

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    termsAccepted: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password])

  const isFormFilled =
    form.fullName.trim().length >= 2 &&
    EMAIL_PATTERN.test(form.email) &&
    form.password.length >= 8 &&
    form.termsAccepted

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter your full name.'
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !form.termsAccepted) return

    setIsLoading(true)
    // eslint-disable-next-line no-console
    console.log('Create account submitted:', {
      subjectName: subject.name,
      subjectPhoto: subject.photoDataUrl,
      timeCommitment: subject.timeCommitment,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    })

    window.setTimeout(() => {
      setIsLoading(false)
      navigate('/dashboard')
    }, 900)
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-deep">
      <FlowHeader backTo="/dashboard" closeTo="/dashboard" accentBack />

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-2 sm:pt-6">
        <div className="w-full max-w-xl animate-fadeIn text-center">
          <h1 className="font-display text-[34px] font-medium leading-[1.15] text-ink sm:text-[42px]">
            Save your memoir
            <br className="hidden sm:block" /> and continue.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-ink/60">
            Create an account to protect your memoir, invite your family, and return to it
            whenever you wish.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 rounded-[28px] bg-cream p-7 text-left shadow-card sm:p-9"
          >
            <div>
              <label htmlFor="fullName" className="block font-body text-sm font-medium text-ink">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                aria-invalid={Boolean(errors.fullName)}
                className={`mt-2 w-full rounded-xl border bg-white/70 px-4 py-3.5 font-body text-[15px] text-ink placeholder:text-ink/35 transition focus:outline-none focus:ring-2 focus:ring-clay-300 ${
                  errors.fullName ? 'border-red-400' : 'border-ink/15 focus:border-clay-500'
                }`}
              />
              {errors.fullName && <p className="mt-1.5 text-[13px] text-red-500">{errors.fullName}</p>}
            </div>

            <div className="mt-5">
              <label htmlFor="email" className="block font-body text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                aria-invalid={Boolean(errors.email)}
                className={`mt-2 w-full rounded-xl border bg-white/70 px-4 py-3.5 font-body text-[15px] text-ink placeholder:text-ink/35 transition focus:outline-none focus:ring-2 focus:ring-clay-300 ${
                  errors.email ? 'border-red-400' : 'border-ink/15 focus:border-clay-500'
                }`}
              />
              {errors.email && <p className="mt-1.5 text-[13px] text-red-500">{errors.email}</p>}
            </div>

            <div className="mt-5">
              <label htmlFor="password" className="block font-body text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="********"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  aria-invalid={Boolean(errors.password)}
                  className={`w-full rounded-xl border bg-white/70 px-4 py-3.5 pr-11 font-body text-[15px] text-ink placeholder:text-ink/35 transition focus:outline-none focus:ring-2 focus:ring-clay-300 ${
                    errors.password ? 'border-red-400' : 'border-ink/15 focus:border-clay-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/45 transition hover:text-ink/75"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-[13px] text-red-500">{errors.password}</p>}
              {!errors.password && strength && (
                <div className="mt-2.5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.width} ${strength.className.split(' ')[0]}`} />
                  </div>
                  <p className={`mt-1 text-[12.5px] font-medium ${strength.className.split(' ')[1]}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => setForm((f) => ({ ...f, termsAccepted: e.target.checked }))}
                className="mt-0.5 h-[18px] w-[18px] flex-none cursor-pointer rounded border-ink/30 text-clay-500 focus:ring-clay-400"
              />
              <span className="text-[14.5px] leading-relaxed text-ink/75">
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  className="font-medium text-clay-600 underline underline-offset-2 hover:text-clay-700"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="font-medium text-clay-600 underline underline-offset-2 hover:text-clay-700"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!isFormFilled || isLoading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 px-6 py-3.5 font-body font-medium text-cream shadow-card transition hover:bg-clay-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-ink/10" />
              <span className="text-xs font-medium tracking-wide text-ink/40">OR</span>
              <span className="h-px flex-1 bg-ink/10" />
            </div>

            <button
              type="button"
              onClick={() => console.log('Continue with Google clicked')}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 bg-white px-6 py-3.5 font-body font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-card"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-7 text-[15px] text-ink/65">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => console.log('Log in clicked')}
              className="font-medium text-clay-600 underline underline-offset-2 hover:text-clay-700"
            >
              Log in
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71a5.4 5.4 0 010-3.42V4.95H.96a9 9 0 000 8.1l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}
