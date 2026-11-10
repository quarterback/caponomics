import { useEffect, useState } from 'react'
import { charterFit } from '../../engine/systems'
import { encodeState, useStore } from '../store'

const FAMILY = [
  { name: 'Ballot Buffet', blurb: 'Transferable-vote imagineering', url: '', current: true },
  { name: 'Cap Buffet', blurb: 'Salary cap imagineering', url: 'https://capbuffet.com/' },
  { name: 'Lottery Lab', blurb: 'Draft-lottery simulator', url: 'https://lottery.capbuffet.com/' },
]

function useTheme(): [string, () => void] {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('ballot-theme') ?? 'auto')
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    localStorage.setItem('ballot-theme', theme)
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'auto' ? 'light' : t === 'light' ? 'dark' : 'auto'))]
}

export function Toolbar({ onAbout }: { onAbout: () => void }) {
  const system = useStore((s) => s.system)
  const forked = useStore((s) => s.forked)
  const [theme, cycle] = useTheme()
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const fit = charterFit(system)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('.menu')) setMenu(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const copyLink = async () => {
    const frag = `b=${encodeState()}`
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${frag}`)
    } catch {
      location.hash = frag
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="dot" />
        Ballot Buffet
        <small>transferable-vote imagineering</small>
      </div>
      <div className="toolbar__spacer" />
      <div className="toolbar__ruleset">
        <span>system</span>
        <strong>{system.name}</strong>
        {forked && (
          <span className="pchip" data-cur="tools" title="Edited from a preset">
            forked
          </span>
        )}
        <span className="fit-chip" data-level={fit.level} title={fit.reasons.join('\n')}>
          {fit.label}
        </span>
      </div>
      <div className="menu">
        <button className="btn btn--sm" onClick={() => setMenu(!menu)}>
          Tools ▾
        </button>
        {menu && (
          <div className="menu__pop">
            {FAMILY.map((t) =>
              t.current ? (
                <div className="menu__item menu__item--current" key={t.name}>
                  {t.name} <span className="here">you’re here</span>
                  <small>{t.blurb}</small>
                </div>
              ) : (
                <a key={t.name} className="menu__item" href={t.url} target="_blank" rel="noopener noreferrer">
                  {t.name} ↗<small>{t.blurb}</small>
                </a>
              ),
            )}
          </div>
        )}
      </div>
      <button className="btn btn--sm btn--primary" onClick={copyLink}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button className="btn btn--ghost btn--sm" onClick={onAbout}>
        About
      </button>
      <button className="btn--icon" title={`Theme: ${theme}`} onClick={cycle} aria-label="Toggle theme">
        {theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}
      </button>
    </header>
  )
}
