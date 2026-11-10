import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { serializeRuleset, encodeRulesetToHash } from '../../engine/serialize'
import { serializeModel, encodeModelToHash } from '../../engine/expansion/serialize'
import { CURRENCY_LIST, currencySymbol, type Currency } from '../../engine/format'
import { REMIXES } from '../remixes'
import { FAMILY_TOOLS } from '../family'
import { useStore } from '../state/store'
import { useExpansion } from '../state/expansionStore'
import { useCup } from '../state/cupStore'
import { serializeCup, encodeCupToHash } from '../../engine/cup/serialize'

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
  const { ruleset, forked, loadRulesetObject, loadRemix, setCurrency } = useStore()
  const { tab, setTab, model, forked: modelForked, loadModelObject } = useExpansion()
  const currency = ruleset.currency ?? 'USD'
  const [theme, cycleTheme] = useTheme()
  const [menu, setMenu] = useState<null | 'remix' | 'tools'>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [copied, setCopied] = useState(false)

  const cup = useCup()
  const onCap = tab === 'cap'
  const onCup = tab === 'cup'
  // What the current tab calls the thing being edited, for Save / Import text.
  const thing = onCap ? 'cap system' : onCup ? 'cup format' : 'expansion draft'

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('.menu')) setMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const save = () => {
    const json = onCap ? serializeRuleset(ruleset) : onCup ? serializeCup(cup.model) : serializeModel(model)
    const id = onCap ? ruleset.id || 'ruleset' : onCup ? cup.model.id || 'cup-format' : model.id || 'expansion-model'
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${id}.caponomics.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyLink = async () => {
    const frag = onCap ? `r=${encodeRulesetToHash(ruleset)}` : onCup ? `c=${encodeCupToHash(cup.model)}` : `x=${encodeModelToHash(model)}`
    const url = `${location.origin}${location.pathname}#${frag}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      location.hash = frag
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText)
      if (onCap) loadRulesetObject(parsed)
      else if (onCup) cup.loadModelObject(parsed)
      else loadModelObject(parsed)
      setImportOpen(false)
      setImportText('')
    } catch {
      alert(`That text is not a saved ${thing}. Check that you copied all of it.`)
    }
  }

  const themeLabel = theme === 'auto' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark'

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="dot" />
        Cap Buffet
      </div>

      <div className="seg toolbar__tabs" role="tablist">
        <button role="tab" data-active={onCap} onClick={() => setTab('cap')}>
          Cap System
        </button>
        <button role="tab" data-active={tab === 'expansion'} onClick={() => setTab('expansion')}>
          Expansion Draft
        </button>
        <button role="tab" data-active={onCup} onClick={() => setTab('cup')}>
          Cup Format
        </button>
      </div>

      <div className="toolbar__spacer" />

      <div className="toolbar__ruleset">
        <strong>{onCap ? ruleset.name : onCup ? cup.model.name : model.name}</strong>
        {(onCap ? forked : onCup ? cup.forked : modelForked) && (
          <span className="pchip" data-cur="tools" title="You changed this from the version you loaded">
            edited
          </span>
        )}
      </div>

      {onCap && (
        <select
          className="cur-select mono"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          title="Display currency (converts money to this currency)"
        >
          {CURRENCY_LIST.map((c) => (
            <option key={c} value={c}>
              {currencySymbol(c)} {c}
            </option>
          ))}
        </select>
      )}

      <div className="menu">
        <button className="btn btn--sm" onClick={() => setMenu(menu === 'tools' ? null : 'tools')}>
          Tools ▾
        </button>
        {menu === 'tools' && (
          <div className="menu__pop">
            {FAMILY_TOOLS.map((t) =>
              t.current ? (
                <div className="menu__item menu__item--current" key={t.id}>
                  {t.name} <span className="here">you’re here</span>
                  <small>{t.blurb}</small>
                </div>
              ) : (
                <a
                  key={t.id}
                  className="menu__item"
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenu(null)}
                >
                  {t.name} ↗<small>{t.blurb}</small>
                </a>
              ),
            )}
          </div>
        )}
      </div>

      {onCap && (
        <div className="menu">
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
      )}

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

      {/* Portaled to <body>: a modal left inside the sticky toolbar is positioned
          against the toolbar (any filter/transform there traps position:fixed)
          and gets clipped to the header strip. */}
      {importOpen &&
        createPortal(
        <div className="modal-backdrop" onClick={() => setImportOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card__head">
              <span className="card__title">Load a saved {thing}</span>
              <button className="btn--icon" style={{ marginLeft: 'auto' }} onClick={() => setImportOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="card__body" style={{ display: 'grid', gap: 'var(--s3)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
                Paste the text of a {thing} that you saved, or that someone sent you. You do not need this for a shared link. A
                link opens the {thing} by itself.
              </p>
              <textarea
                placeholder={`Paste the saved ${thing} here`}
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
        </div>,
          document.body,
        )}
    </header>
  )
}
