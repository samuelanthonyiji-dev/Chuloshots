"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import GlassFolder, { type ArtRecipe, type FolderFile } from "@/components/ui/glass-folder-cards"

type Video = { src: string; title: string; meta: string; poster: string }

/** All four edits live in the first folder. */
const VIDEOS: Video[] = [
  { src: "/videos/transitions.mp4", title: "Merge Transitions", meta: "Performance edit · 1:48", poster: "/images/poster-transitions.webp" },
  { src: "/videos/uganda-vlog.mp4", title: "Gaise Baba: Uganda Tour", meta: "Tour vlog · 1:13", poster: "/images/poster-uganda-vlog.webp" },
  { src: "/videos/smm-ad.mp4", title: "Social Media Manager Ad", meta: "Brand promo · 1:58", poster: "/images/poster-smm-ad.webp" },
  { src: "/videos/musician.mp4", title: "Musician's POV", meta: "Performance edit · 2:25", poster: "/images/poster-musician.webp" },
]

const VIDEO_FILES: FolderFile[] = VIDEOS.map((v) => ({ name: v.title, meta: v.meta.split(" · ")[1], image: v.poster }))

/** Back-panel artwork in the site's cobalt blue. */
const COBALT: ArtRecipe = {
  style: "marble",
  colors: ["#0b0d12", "#142a8f", "#2f5bff", "#10131b", "#4a72ff", "#8aa4ff", "#e9eefc"],
  scale: 0.7,
  warp: 3.2,
  angle: -0.4,
  gloss: 0.5,
  veins: 0.4,
}

declare global {
  interface Window {
    /** Set by /site.js: plays a video in the page's player. */
    chuloPlay?: (v: { src: string; title: string; meta: string }) => void
  }
}

function play(v: Video) {
  if (window.chuloPlay) window.chuloPlay(v)
  else window.location.href = v.src // the page script hasn't loaded yet: open the video directly
}

/**
 * The three folders in the home page's "My work" section, drawn into #work-folders.
 * Folder one holds every video; the other two are empty for now.
 */
export default function WorkFolders() {
  const [mount, setMount] = React.useState<HTMLElement | null>(null)
  const [width, setWidth] = React.useState(340)

  React.useEffect(() => {
    const el = document.getElementById("work-folders")
    if (!el) return
    const fit = () => setWidth(Math.max(260, Math.min(340, Math.floor(el.clientWidth))))
    fit()
    // The mount point is static HTML that only exists once the page is in the browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMount(el)
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!mount) return null
  return createPortal(
    <>
      <GlassFolder
        label="Edits"
        meta={VIDEOS.length + " videos"}
        art={COBALT}
        seed={7}
        files={VIDEO_FILES}
        action="none"
        width={width}
        onFileSelect={(_, i) => play(VIDEOS[i])}
      />
      <GlassFolder label="Brand work" meta="Coming soon" art="glacier" seed={5} files={[]} action="none" width={width} appearDelay={140} />
      <GlassFolder label="Shorts & reels" meta="Coming soon" art="dusk" seed={9} files={[]} action="none" width={width} appearDelay={280} />
    </>,
    mount,
  )
}
