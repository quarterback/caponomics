import { useState } from 'react'
import { Toolbar } from './ui/components/Toolbar'
import { Rail } from './ui/components/Rail'
import { Rules } from './ui/components/Rules'
import { Contest } from './ui/components/Contest'
import { Results } from './ui/components/Results'
import { About } from './ui/components/About'

export function App() {
  const [about, setAbout] = useState(false)
  return (
    <div className="shell">
      <Toolbar onAbout={() => setAbout(true)} />
      <div className="shell__body">
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
