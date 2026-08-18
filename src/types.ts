export type TimeCommitment = 'light' | 'deep'

export interface MemoirSubject {
  /** Data URL of the uploaded photo, or null if none was provided */
  photoDataUrl: string | null
  /** Original filename, kept for reference / re-upload affordance */
  photoFileName: string | null
  /** The subject's name as entered on the onboarding screen */
  name: string
  /** How much time the owner wants to dedicate weekly, chosen on the pacing screen */
  timeCommitment: TimeCommitment | null
}

export const emptyMemoirSubject: MemoirSubject = {
  photoDataUrl: null,
  photoFileName: null,
  name: '',
  timeCommitment: null,
}
