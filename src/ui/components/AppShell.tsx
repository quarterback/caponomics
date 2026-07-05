import { PresetRail } from './sidebar/PresetRail'
import { RulesetBuilder } from './workspace/RulesetBuilder'
import { CompliancePanel } from './compliance/CompliancePanel'
import { Toolbar } from './Toolbar'

export function AppShell() {
  return (
    <div className="shell">
      <Toolbar />
      <div className="shell__body">
        <PresetRail />
        <div className="col">
          <RulesetBuilder />
        </div>
        <CompliancePanel />
      </div>
    </div>
  )
}
