const PUBLICATIONS = ['The Times', 'Chronicle', 'Legacy', 'Heritage']

export default function AsSeenIn() {
  return (
    <div className="border-t border-ink/10 pt-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">As seen in</p>
      <ul className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
        {PUBLICATIONS.map((name) => (
          <li
            key={name}
            className="font-display text-lg text-ink/35 transition-colors hover:text-ink/60"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}
