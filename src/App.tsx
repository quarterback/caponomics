import { useEffect } from 'react'
import './ui/app.css'
import { AppShell } from './ui/components/AppShell'
import { decodeRulesetFromHash } from './engine/serialize'
import { decodeModelFromHash } from './engine/expansion/serialize'
import { useStore } from './ui/state/store'
import { useExpansion } from './ui/state/expansionStore'

export function App() {
  const loadRulesetObject = useStore((s) => s.loadRulesetObject)
  const loadModelObject = useExpansion((s) => s.loadModelObject)
  const setTab = useExpansion((s) => s.setTab)

  // Load a shared ruleset (#r=<base64>) or expansion model (#x=<base64>) from
  // the URL hash on first mount.
  useEffect(() => {
    const r = /(?:^|[#&])r=([^&]+)/.exec(location.hash)
    if (r && r[1]) {
      const ruleset = decodeRulesetFromHash(r[1])
      if (ruleset) loadRulesetObject(ruleset, true)
    }
    const x = /(?:^|[#&])x=([^&]+)/.exec(location.hash)
    if (x && x[1]) {
      const model = decodeModelFromHash(x[1])
      if (model) {
        loadModelObject(model, true)
        setTab('expansion')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AppShell />
}
