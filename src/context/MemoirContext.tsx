import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { emptyMemoirSubject, type MemoirSubject } from '../types'

interface MemoirContextValue {
  subject: MemoirSubject
  /** Merges the given fields into the current subject, so callers only need to pass what changed. */
  updateSubject: (patch: Partial<MemoirSubject>) => void
  reset: () => void
}

const MemoirContext = createContext<MemoirContextValue | undefined>(undefined)

export function MemoirProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<MemoirSubject>(emptyMemoirSubject)

  const value = useMemo<MemoirContextValue>(
    () => ({
      subject,
      updateSubject: (patch) => setSubject((prev) => ({ ...prev, ...patch })),
      reset: () => setSubject(emptyMemoirSubject),
    }),
    [subject],
  )

  return <MemoirContext.Provider value={value}>{children}</MemoirContext.Provider>
}

export function useMemoirSubject(): MemoirContextValue {
  const ctx = useContext(MemoirContext)
  if (!ctx) {
    throw new Error('useMemoirSubject must be used within a MemoirProvider')
  }
  return ctx
}
