import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My work · Chuloshots",
  robots: { index: false },
}

// "My work" now lives on the home page. This address forwards there so links already shared keep working.
export default function WorkRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/#work" />
      <script dangerouslySetInnerHTML={{ __html: "location.replace('/#work')" }} />
      <p style={{ padding: 24 }}>
        Opening my work…{" "}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/#work">Tap here if nothing happens</a>.
      </p>
    </>
  )
}
