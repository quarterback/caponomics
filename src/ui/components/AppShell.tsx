import { useState } from 'react'
import { PresetRail } from './sidebar/PresetRail'
import { RulesetBuilder } from './workspace/RulesetBuilder'
import { LeaguePanel } from './compliance/LeaguePanel'
import { ExpansionRail } from './expansion/ExpansionRail'
import { ExpansionBuilder } from './expansion/ExpansionBuilder'
import { ModelSummary } from './expansion/ModelSummary'
import { Toolbar } from './Toolbar'
import { About } from './About'
import { CupRail } from './cup/CupRail'
import { CupBuilder } from './cup/CupBuilder'
import { CupSummary } from './cup/CupSummary'
import { useExpansion } from '../state/expansionStore'


/** "Results only" view: hides the setup columns so the output fills the page. */
function useFocus(key: string): [boolean, () => void] {
  const [focus, setFocus] = useState<boolean>(() => {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  })
  const toggle = () =>
    setFocus((f) => {
      try {
        localStorage.setItem(key, f ? '0' : '1')
      } catch {
        /* storage unavailable */
      }
      return !f
    })
  return [focus, toggle]
}

export function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [focus, toggleFocus] = useFocus('cap-focus')
  const tab = useExpansion((s) => s.tab)
  return (
    <div className="shell">
      <Toolbar onAbout={() => setAboutOpen(true)} focus={focus} onFocus={toggleFocus} />
      {tab === 'cap' ? (
        <div className="shell__body" data-focus={focus}>
          <PresetRail />
          <div className="col">
            <RulesetBuilder />
          </div>
          <LeaguePanel />
        </div>
      ) : tab === 'cup' ? (
        <div className="shell__body" data-focus={focus}>
          <CupRail />
          <div className="col">
            <CupBuilder />
          </div>
          <CupSummary />
        </div>
      ) : (
        <div className="shell__body" data-focus={focus}>
          <ExpansionRail />
          <div className="col">
            <ExpansionBuilder />
          </div>
          <ModelSummary />
        </div>
      )}
      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
