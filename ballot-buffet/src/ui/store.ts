import { create } from 'zustand'
import { PROFILES, generateProfile, parseBallots, formatBallots, DEFAULT_GEN } from '../engine/profiles'
import { PORTLAND, SYSTEMS } from '../engine/systems'
import type { GenParams, Profile, System } from '../engine/types'

interface State {
  system: System
  forked: boolean
  profile: Profile
  seats: number
  loadSystem: (s: System) => void
  patchSystem: (p: Partial<System>) => void
  loadProfile: (p: Profile) => void
  setSeats: (n: number) => void
  setGen: (p: Partial<GenParams>) => void
  applyText: (text: string) => string[]
}

export const useStore = create<State>((set, get) => ({
  system: PORTLAND,
  forked: false,
  profile: PROFILES[0]!,
  seats: PROFILES[0]!.seats,
  loadSystem: (s) => set({ system: s, forked: false }),
  patchSystem: (p) => set({ system: { ...get().system, ...p }, forked: true }),
  loadProfile: (p) => set({ profile: p, seats: p.seats }),
  setSeats: (n) => set({ seats: Math.max(1, Math.min(9, n)) }),
  setGen: (p) => {
    const cur = get().profile
    const gen = { ...(cur.gen ?? DEFAULT_GEN), ...p }
    set({ profile: generateProfile(gen, { seats: get().seats }) })
  },
  applyText: (text) => {
    const { candidates, ballots, errors } = parseBallots(text)
    if (errors.length || !ballots.length) return errors.length ? errors : ['No ballots found.']
    set({
      profile: {
        id: 'custom',
        name: 'Custom ballots',
        blurb: `${ballots.reduce((s, b) => s + b.n, 0).toLocaleString()} ballots · ${candidates.length} candidates`,
        seats: get().seats,
        candidates,
        ballots,
      },
    })
    return []
  },
}))

// ── share links: #b=<base64 json> ──

interface Shared {
  s: System
  n: number
  p: { id: string } | { gen: GenParams } | { text: string }
}

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_')
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

export function encodeState(): string {
  const { system, seats, profile } = useStore.getState()
  const preset = PROFILES.some((p) => p.id === profile.id)
  const p: Shared['p'] = preset ? { id: profile.id } : profile.gen ? { gen: profile.gen } : { text: formatBallots(profile) }
  return b64(JSON.stringify({ s: system, n: seats, p } satisfies Shared))
}

export function loadFromHash(hash: string): void {
  const m = /(?:^|[#&])b=([^&]+)/.exec(hash)
  if (!m) return
  try {
    const sh = JSON.parse(unb64(m[1]!)) as Shared
    const st = useStore.getState()
    if ('id' in sh.p) {
      const id = sh.p.id
      st.loadProfile(PROFILES.find((x) => x.id === id) ?? PROFILES[0]!)
    } else if ('gen' in sh.p) st.loadProfile(generateProfile(sh.p.gen))
    else st.applyText(sh.p.text)
    const base = SYSTEMS.find((x) => x.id === sh.s.id) ?? PORTLAND
    const system = { ...base, ...sh.s }
    useStore.setState({ system, forked: JSON.stringify(system) !== JSON.stringify(base), seats: sh.n })
  } catch {
    /* ignore malformed links */
  }
}
