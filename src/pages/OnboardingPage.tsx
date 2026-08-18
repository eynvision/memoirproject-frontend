import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import PhotoUpload from '../components/PhotoUpload'
import Button from '../components/Button'
import { useMemoirSubject } from '../context/MemoirContext'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { subject, updateSubject } = useMemoirSubject()

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(subject.photoDataUrl)
  const [photoFileName, setPhotoFileName] = useState<string | null>(subject.photoFileName)
  const [name, setName] = useState(subject.name)

  const canContinue = Boolean(photoDataUrl) && name.trim().length > 0

  const handleContinue = () => {
    if (!canContinue) return
    updateSubject({ photoDataUrl, photoFileName, name: name.trim() })
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Go back"
          className="rounded-full p-2 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Close"
          className="rounded-full p-2 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-6 pt-8 sm:pt-16">
        <div className="w-full max-w-md animate-fadeIn text-center">
          <h1 className="font-display text-[26px] font-medium text-ink sm:text-[28px]">
            Who is this memoir for?
          </h1>

          <div className="mt-10 flex justify-center">
            <PhotoUpload
              photoDataUrl={photoDataUrl}
              onChange={(dataUrl, fileName) => {
                setPhotoDataUrl(dataUrl)
                setPhotoFileName(fileName)
              }}
            />
          </div>

          <div className="mt-10">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subject's Name"
              aria-label="Subject's name"
              className="w-full border-0 border-b border-ink/25 bg-transparent pb-3 text-center font-body text-lg text-ink placeholder:text-ink/40 focus:border-clay-500 focus:outline-none focus:ring-0"
            />
            <p className="mt-4 text-sm leading-relaxed text-ink/55">
              This name will appear on the memoir cover and throughout the memoir workspace.
            </p>
          </div>
        </div>
      </main>

      {/* Footer actions */}
      <footer className="flex items-center justify-between px-6 py-8 sm:px-10">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="font-body text-[15px] text-ink/70 transition hover:text-ink"
        >
          Back
        </button>
        <Button variant="primary" disabled={!canContinue} onClick={handleContinue}>
          Continue
        </Button>
      </footer>
    </div>
  )
}
