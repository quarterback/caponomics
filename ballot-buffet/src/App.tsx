import { useState } from 'react'
import { Toolbar } from './ui/components/Toolbar'
import { Rail } from './ui/components/Rail'
import { Rules } from './ui/components/Rules'
import { Contest } from './ui/components/Contest'
import { Results } from './ui/components/Results'
import { About } from './ui/components/About'


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

export function App() {
  const [about, setAbout] = useState(false)
  const [focus, toggleFocus] = useFocus('ballot-focus')
  return (
    <div className="shell">
      <Toolbar onAbout={() => setAbout(true)} focus={focus} onFocus={toggleFocus} />
      <div className="shell__body" data-focus={focus}>
        <Rail />
        <div className="col">
          <Contest />
          <Rules />
        </div>
        <Results />
      </div>
      {about && <About onClose={() => setAbout(false)} />}
    </div>
  )
}
