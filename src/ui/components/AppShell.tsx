import { useState } from 'react'
import { PresetRail } from './sidebar/PresetRail'
import { RulesetBuilder } from './workspace/RulesetBuilder'
import { LeaguePanel } from './compliance/LeaguePanel'
import { Toolbar } from './Toolbar'
import { About } from './About'

export function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false)
  return (
    <div className="shell">
      <Toolbar onAbout={() => setAboutOpen(true)} />
      <div className="shell__body">
        <PresetRail />
        <div className="col">
          <RulesetBuilder />
        </div>
        <LeaguePanel />
      </div>
      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
