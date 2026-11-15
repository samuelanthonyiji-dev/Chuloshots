"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { KineticGrid } from "@/components/ui/kinetic-grid"

const DOT: [number, number, number] = [255, 255, 255]
const GLOW: [number, number, number] = [138, 164, 255] // the site's light cobalt

/**
 * Draws the kinetic dot grid into every `.kg-bg` placeholder on the home page:
 * behind the opening section + timeline strip, and behind Tools & skills.
 */
export default function KineticBackgrounds() {
  const [mounts, setMounts] = React.useState<HTMLElement[]>([])
  React.useEffect(() => {
    // The placeholders are static HTML that only exist once the page is in the browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounts(Array.from(document.querySelectorAll<HTMLElement>(".kg-bg")))
  }, [])
  return <>{mounts.map((el, i) => createPortal(<KineticGrid dot={DOT} glow={GLOW} />, el, "kg-" + i))}</>
}
