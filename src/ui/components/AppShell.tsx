import { useState } from 'react'
import { PresetRail } from './sidebar/PresetRail'
import { RulesetBuilder } from './workspace/RulesetBuilder'
import { LeaguePanel } from './compliance/LeaguePanel'
import { ExpansionRail } from './expansion/ExpansionRail'
import { ExpansionBuilder } from './expansion/ExpansionBuilder'
import { ModelSummary } from './expansion/ModelSummary'
import { Toolbar } from './Toolbar'
import { About } from './About'
import { useExpansion } from '../state/expansionStore'

export function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const tab = useExpansion((s) => s.tab)
  return (
    <div className="shell">
      <Toolbar onAbout={() => setAboutOpen(true)} />
      {tab === 'cap' ? (
        <div className="shell__body">
          <PresetRail />
          <div className="col">
            <RulesetBuilder />
          </div>
          <LeaguePanel />
        </div>
      ) : (
        <div className="shell__body">
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
