import { useEffect, useRef, useState } from 'react'
import { serializeRuleset, encodeRulesetToHash } from '../../engine/serialize'
import { REMIXES } from '../remixes'
import { useStore } from '../state/store'

function useTheme(): [string, () => void] {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('cap-theme') ?? 'auto')
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    localStorage.setItem('cap-theme', theme)
  }, [theme])
  const cycle = () => setTheme((t) => (t === 'auto' ? 'light' : t === 'light' ? 'dark' : 'auto'))
  return [theme, cycle]
}

export function Toolbar({ onAbout }: { onAbout: () => void }) {
  const { ruleset, forked, loadRulesetObject, loadRemix } = useStore()
  const [theme, cycleTheme] = useTheme()
  const [menu, setMenu] = useState<null | 'remix'>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const save = () => {
    const blob = new Blob([serializeRuleset(ruleset)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ruleset.id || 'ruleset'}.caponomics.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyLink = async () => {
    const hash = encodeRulesetToHash(ruleset)
    const url = `${location.origin}${location.pathname}#r=${hash}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      location.hash = `r=${hash}`
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const doImport = () => {
    try {
      loadRulesetObject(JSON.parse(importText))
      setImportOpen(false)
      setImportText('')
    } catch {
      alert('That doesn’t look like valid ruleset JSON.')
    }
  }

  const themeLabel = theme === 'auto' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark'

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="dot" />
        caponomics
        <small>salary cap imagineering</small>
      </div>

      <div className="toolbar__spacer" />

      <div className="toolbar__ruleset">
        <span>system</span>
        <strong>{ruleset.name}</strong>
        {forked && (
          <span className="pchip" data-cur="tools" title="Edited from a preset">
            forked
          </span>
        )}
      </div>

      <div className="menu" ref={menuRef}>
        <button className="btn btn--sm" onClick={() => setMenu(menu === 'remix' ? null : 'remix')}>
          Remixes ▾
        </button>
        {menu === 'remix' && (
          <div className="menu__pop">
            {REMIXES.map((r) => (
              <button
                key={r.id}
                className="menu__item"
                onClick={() => {
                  loadRemix(r.build(), r.rosterId)
                  setMenu(null)
                }}
              >
                {r.label}
                <small>{r.description}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn--sm" onClick={() => setImportOpen(true)}>
        Import
      </button>
      <button className="btn btn--sm" onClick={save}>
        Save
      </button>
      <button className="btn btn--sm btn--primary" onClick={copyLink}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button className="btn btn--ghost btn--sm" onClick={onAbout}>
        About
      </button>
      <button className="btn--icon" title={`Theme: ${themeLabel}`} onClick={cycleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}
      </button>

      {importOpen && (
        <div className="modal-backdrop" onClick={() => setImportOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card__head">
              <span className="card__title">Import a ruleset</span>
              <button className="btn--icon" style={{ marginLeft: 'auto' }} onClick={() => setImportOpen(false)}>
                ✕
              </button>
            </div>
            <div className="card__body" style={{ display: 'grid', gap: 'var(--s3)' }}>
              <textarea
                placeholder="Paste ruleset JSON (from Save)…"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn" onClick={() => setImportOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn--primary" onClick={doImport}>
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
