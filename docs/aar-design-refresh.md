# After-Action Report — Import dialog fix and the Chromatic Editorial refresh

**Date completed:** 2026-11-10
**Branch:** `claude/peaceful-faraday-35fzk2`

Continues `aar-workarounds-and-cap-buffet.md`. Two things in one pass: a bug on the web build
of Cap Buffet, and the first visual change since the tool was built.

---

## What was asked for

- A screenshot of capbuffet.com with the **Import a ruleset** dialog cut off: only its title strip
  showed, wedged into the toolbar. *"found a bug in actual cap buffet that needs to be fixed."*
- *"the UI also could use a refresh… now i have a whole design system i use on all my sites and
  color theory."*

---

## What shipped

### 1. The Import dialog bug
**Cause.** The dialog was rendered inside the sticky toolbar, and the toolbar had
`backdrop-filter: blur(10px)`. A filtered element becomes the containing block for
`position: fixed` descendants, so the full-screen backdrop was sized to the toolbar strip and the
dialog was clipped to it. An earlier fix had removed the filter on phones only, which is why the
desktop web build still broke.

**Fix.** The dialog is now portaled to `<body>` (`createPortal` in `Toolbar.tsx`), so nothing
in the toolbar can trap it. The refresh also drops the blur from the toolbar altogether.

### 2. The refresh
The design system is the Chromatic Editorial System from `dev-site/assets/core.css`: colour
*roles* filled from a fixed pigment set, square 2px frames, hairline rules, hard offset shadows,
mono uppercase labels, an ink top bar with a lead rule.

- `src/ui/theme.css` — rewritten around the roles (`--bg --bg-deeper --ink --ink-soft --rule
  --accent --lead --on-lead --deep --on-deep`). The old component tokens (`--surface`,
  `--text`, `--border`, `--brand`, radii, shadows) are kept as aliases of the roles, so the
  1,300 lines of component CSS follow the scheme without being rewritten.
- `src/ui/system.css` — new, loaded after `app.css`. Structure only: frames, labels, buttons,
  segmented controls, switches, inputs, the top bar.
- Fonts at this point were unchanged (General Sans, Azeret Mono, Outfit), mapped into the system's
  type slots. The monospace face was removed later; see section 3.

**Pigments.** Cap Buffet's own five, which were already named in the old theme file but mostly
unused: Tangerine `#ff6b35`, Peach `#f7c59f`, Beige `#efefd0`, Steel `#004e89`, Baltic
`#1a659e`. Light scheme is Beige paper with Steel ink; dark is Steel night with Beige ink. The
old cyan brand colour `#00b7e0` is no longer used.

### 3. Later the same day
Ron reviewed the refresh against three rule sets (`no-slop-ui`, `red-pen-editor`,
`plain-language-default`) and gave direct instructions. Changes to Cap Buffet:

- **No eyebrow text or captions.** The tagline beside the wordmark, the small "system" label, and
  every caption in a card header are gone.
- **No monospace type.** Figures and labels use General Sans with tabular numerals. Azeret Mono
  and JetBrains Mono are no longer loaded.
- **Headings are questions or statements**, in sentence case, following the federal plain-language
  guidance on headings: "How does each team fare?", "Which cap system?", "What is Cap Buffet?".
  Uppercase is kept for table column heads and rule-category labels only.
- **Nothing moves on hover**, and the app honours the reduced-motion setting.
- **Descriptions and help text** were rewritten in plain language in a separate pass.
- **The Import dialog** names what it loads and says a shared link needs no import.

Not changed: the metric tiles on the Cap System tab. They are the kind of KPI grid the no-slop
checklist flags, and they predate this work.

---

## Validation

- `npm test` — 64 tests pass. `npm run build` clean.
- Import dialog measured in a headless browser: centred at 1500px wide (640×368 at y=291) and at
  390px wide (358×379), where before it was clipped to the toolbar.
- Screenshots reviewed: Cap System and Expansion Draft tabs, light and dark, desktop and phone.
- Contrast of every role pair, WCAG 2 ratio and APCA Lc (L = light scheme, D = dark):

```
L ink/bg                           #00233e #f8f8ea wcag 14.97 Lc 98
L soft/bg                          #004579 #f8f8ea wcag 9.22 Lc 88
L accent/bg                        #c75329 #f8f8ea wcag 4.17 Lc 65
L ink/deeper                       #00233e #fad9c1 wcag 12.03 Lc 84
L soft/deeper                      #004579 #fad9c1 wcag 7.41 Lc 74
L onLead/lead                      #001729 #ff6b35 wcag 6.41 Lc 49
L onDeep/deep                      #efefd0 #004e89 wcag 7.31 Lc 82
L rule/bg                          #1a659e #f8f8ea wcag 5.77 Lc 76
L good/bg                          #0a6b4d #f8f8ea wcag 6.08 Lc 77
L good/deeper                      #0a6b4d #fad9c1 wcag 4.89 Lc 63
L warn/bg                          #8a4b00 #f8f8ea wcag 6.35 Lc 78
L warn/deeper                      #8a4b00 #fad9c1 wcag 5.11 Lc 64
L bad/bg                           #b3122f #f8f8ea wcag 6.44 Lc 77
L bad/deeper                       #b3122f #fad9c1 wcag 5.18 Lc 63
L ink/beige                        #00233e #efefd0 wcag 13.69 Lc 92
L soft/beige                       #004579 #efefd0 wcag 8.43 Lc 82
D ink/bg                           #efefd0 #001e34 wcag 14.51 Lc 94
D soft/bg                          #f4d4b0 #001e34 wcag 12.05 Lc 82
D accent/bg                        #ff6b35 #001e34 wcag 6.00 Lc 46
D ink/deeper                       #efefd0 #003760 wcag 10.45 Lc 89
D soft/deeper                      #f4d4b0 #003760 wcag 8.68 Lc 77
D onDeep/deep                      #001729 #f7c59f wcag 11.64 Lc 77
D rule/bg                          #538cb6 #001e34 wcag 4.69 Lc 36
D good/bg                          #6fe0b5 #001e34 wcag 10.53 Lc 74
D good/deeper                      #6fe0b5 #003760 wcag 7.58 Lc 69
D warn/bg                          #ffc46b #001e34 wcag 10.82 Lc 75
D warn/deeper                      #ffc46b #003760 wcag 7.79 Lc 70
D bad/bg                           #ff9aa8 #001e34 wcag 8.45 Lc 62
D bad/deeper                       #ff9aa8 #003760 wcag 6.09 Lc 57
```

Tangerine is held to fills, rules and focus rings: dark ink on it is Lc 49, which the system's
DDR-013 rule allows for large type only, so no small text sits on it except the two-word
"forked" chip and the switch knob.

---

## What I did not do

- **No rendered-page contrast audit.** I measured the token pairs, not every text node on every
  page. DDR-013 asks for the rendered audit before a PR; that is still owed.
- **The pigment-to-role mapping is my choice**, made from the palette already in the repo. I had
  no access to the earlier chats about colour, so this should be treated as a proposal.
- **Lottery Lab is untouched.** It lives in `quarterback/Lottery`, which was not attached to this
  session.
- **Not deployed.** capbuffet.com still serves the old build until this branch is merged.
- No component markup changed apart from the dialog portal. Engine, presets and rosters untouched.
