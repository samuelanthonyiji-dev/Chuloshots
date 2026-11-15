"use client"

import * as React from "react"
import { Clapperboard, House, Package, Send, Wrench } from "lucide-react"
import { GlassTabBar, type GlassTabItem } from "@/components/ui/glass-tab-bar"

const icon = { size: 20, strokeWidth: 1.9, "aria-hidden": true } as const

const ITEMS: GlassTabItem[] = [
  { label: "Home", href: "/", icon: <House {...icon} /> },
  { label: "Work", href: "/#work", icon: <Clapperboard {...icon} /> },
  { label: "Packages", href: "/#services", icon: <Package {...icon} /> },
  { label: "Tools", href: "/#tools", icon: <Wrench {...icon} /> },
  { label: "Contact", href: "/#contact", icon: <Send {...icon} /> },
]

/** Section ids on the home page for Work, Packages, Tools and Contact, in page order. */
const SECTIONS = ["work", "services", "tools", "contact"]

/** Which nav item matches what is on screen: Home while the opening section is in view. */
function currentIndex() {
  const line = window.innerHeight * 0.4
  let index = 0
  SECTIONS.forEach((id, i) => {
    const el = document.getElementById(id)
    if (el && el.offsetParent && el.getBoundingClientRect().top < line) index = i + 1
  })
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
  return atBottom ? SECTIONS.length + 1 : index
}

export default function SiteNav() {
  const [active, setActive] = React.useState(0)
  // After a tap, keep the pill on the chosen item while the page scrolls there,
  // instead of letting it follow every section it passes on the way.
  const lockUntil = React.useRef(0)

  React.useEffect(() => {
    let frame = 0
    let settle = 0
    const update = () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      const wait = lockUntil.current - Date.now()
      if (wait > 0) { settle = window.setTimeout(update, wait + 50); return }
      frame = requestAnimationFrame(() => setActive(currentIndex()))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("hashchange", update)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.removeEventListener("scroll", update)
      window.removeEventListener("hashchange", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <header className="nav">
      <div className="wrap">
        {/* Plain links on purpose: each page loads fully so its page script (player, form, motion) runs. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="wordmark logo-clips" href="/" aria-label="Chuloshots home">
          <span className="lc-c"><b>C</b><i>hulo</i></span>
          <span className="lc-s"><b>S</b><i>hots</i></span>
        </a>
        <GlassTabBar
          className="site-links"
          items={ITEMS}
          active={active}
          onSelect={(i) => { lockUntil.current = Date.now() + 1200; setActive(i) }}
        />
      </div>
      <div className="playhead" aria-hidden="true">
        <i />
      </div>
    </header>
  )
}
