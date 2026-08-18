import { type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ImageOff } from 'lucide-react'
import Button from '../components/Button'
import AsSeenIn from '../components/AsSeenIn'
import { useMemoirSubject } from '../context/MemoirContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { subject } = useMemoirSubject()

  const hasSubject = Boolean(subject.photoDataUrl && subject.name)

  const handleStartHere = () => {
    // eslint-disable-next-line no-console
    console.log('Start here clicked. Subject:', subject)
    navigate('/signup')
  }

  const handleSeeHowItWorks = () => {
    // eslint-disable-next-line no-console
    console.log('See how it works clicked. Subject:', subject)
    navigate('/pace')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <span className="font-display text-xl text-ink">The Memoir Project</span>
        <button
          type="button"
          onClick={() => console.log('Log in clicked')}
          className="font-body text-sm font-medium text-clay-600 transition hover:text-clay-700"
        >
          Log in
        </button>
      </nav>

      <main className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-10 sm:px-10 lg:grid-cols-[60%_40%] lg:gap-10 lg:px-16 lg:py-16">
        {/* Left column — content */}
        <section className="order-2 animate-fadeIn lg:order-1">
          {hasSubject && (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-clay-50 px-4 py-1.5 text-sm text-clay-700">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              Creating a memoir for {subject.name}
            </p>
          )}

          <h1 className="text-balance font-display text-[40px] font-medium leading-[1.1] text-ink sm:text-[52px]">
            Save the memories before they fade.
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/65">
            Every family has stories worth preserving. Create one shared memoir where your
            family can collect voices, photographs, and memories of someone you love.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={handleStartHere}>
              Start here
            </Button>
            <Button variant="secondary" onClick={handleSeeHowItWorks}>
              See how it works
            </Button>
          </div>

          <div className="mt-16">
            <AsSeenIn />
          </div>

          <p className="mt-10 text-sm text-ink/45">
            © 2024 The Memoir Project. Preserve your legacy.
          </p>
        </section>

        {/* Right column — photo */}
        <section className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <SubjectPhotoCard
            photoDataUrl={subject.photoDataUrl}
            name={subject.name}
            hasSubject={hasSubject}
          />
        </section>
      </main>
    </div>
  )
}

interface SubjectPhotoCardProps {
  photoDataUrl: string | null
  name: string
  hasSubject: boolean
}

function SubjectPhotoCard({ photoDataUrl, name, hasSubject }: SubjectPhotoCardProps) {
  return (
    <div className="relative mb-8 w-full max-w-[360px]">
      <div
        style={{ '--tilt': '-2deg' } as CSSProperties}
        className="relative animate-photoIn rounded-[28px] border-[10px] border-white bg-white p-0 shadow-frame [transform:rotate(var(--tilt))] sm:border-[12px]"
      >
        <div className="aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-parchment">
          {photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt={name || 'Memoir subject'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink/35">
              <ImageOff className="h-8 w-8" strokeWidth={1.4} />
              <span className="text-sm">No photo yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Name plate, tucked at the corner like a caption on a keepsake photo */}
      <div className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rounded-2xl bg-cream px-5 py-4 text-center shadow-card sm:w-[80%]">
        {hasSubject ? (
          <p className="font-display text-lg text-ink">{name}</p>
        ) : (
          <p className="font-body text-sm text-ink/50">No subject selected</p>
        )}
        {!hasSubject && (
          <Link
            to="/"
            className="mt-1 inline-block text-sm font-medium text-clay-600 underline underline-offset-4 hover:text-clay-700"
          >
            Choose a subject
          </Link>
        )}
      </div>
    </div>
  )
}
