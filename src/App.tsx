import { useEffect } from 'react'
import './ui/app.css'
import { AppShell } from './ui/components/AppShell'
import { decodeRulesetFromHash } from './engine/serialize'
import { useStore } from './ui/state/store'

export function App() {
  const loadRulesetObject = useStore((s) => s.loadRulesetObject)

  // Load a shared ruleset from the URL hash (#r=<base64>) on first mount.
  useEffect(() => {
    const m = /(?:^|[#&])r=([^&]+)/.exec(location.hash)
    if (m && m[1]) {
      const r = decodeRulesetFromHash(m[1])
      if (r) loadRulesetObject(r, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AppShell />
}
