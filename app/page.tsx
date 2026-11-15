import { readFileSync } from "node:fs"
import path from "node:path"
import Script from "next/script"
import SiteNav from "@/components/site-nav"
import WorkFolders from "@/components/work-folders"
import KineticBackgrounds from "@/components/top-grid"

// Home page sections (hero, my work, packages, tools, contact, player, footer), read at build time.
// <WorkFolders /> draws the three glass folders into #work-folders; <KineticBackgrounds /> draws the dot grid into each .kg-bg (top area, Tools & skills).
const body = readFileSync(path.join(process.cwd(), "app", "home-body.html"), "utf8")

export default function Home() {
  return (
    <>
      <SiteNav />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <WorkFolders />
      <KineticBackgrounds />
      <Script src="/site.js" strategy="afterInteractive" />
    </>
  )
}
