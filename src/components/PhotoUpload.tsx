import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Camera, Pencil } from 'lucide-react'

interface PhotoUploadProps {
  photoDataUrl: string | null
  onChange: (dataUrl: string, fileName: string) => void
}

export default function PhotoUpload({ photoDataUrl, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result, file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label={photoDataUrl ? 'Change photo' : 'Add a photo'}
        className={[
          'group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full',
          'transition-all duration-300 ease-out sm:h-48 sm:w-48',
          photoDataUrl
            ? 'shadow-frame'
            : 'border-2 border-dashed border-ink/20 hover:border-clay-500/60 hover:bg-clay-50/60',
          isDragging ? 'border-clay-500 bg-clay-50 scale-[1.02]' : '',
        ].join(' ')}
      >
        {photoDataUrl ? (
          <>
            <img
              src={photoDataUrl}
              alt="Selected subject"
              className="h-full w-full animate-fadeIn object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-200 group-hover:bg-ink/40 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-medium text-ink">
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                Change
              </span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2.5 text-ink/70 transition-colors group-hover:text-clay-600">
            <Camera className="h-7 w-7" strokeWidth={1.5} />
            <span className="font-body text-[15px]">Add photo</span>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
      />
    </div>
  )
}
