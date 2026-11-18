import type { Metadata, Viewport } from "next"
import "./globals.css"
import "./site.css"

// The address shared with people. chuloedits.vercel.app is new, so no app has an old preview of it saved.
const SITE = "https://chuloedits.vercel.app"

// What WhatsApp, Instagram, X, iMessage and search engines show when the link is shared
const SHARE_TITLE = "Chuloshots | Samuel Anthony — Video Editor"
const SHARE_DESCRIPTION =
  "The official home of Samuel Anthony, professionally known as Chulo — a creative video editor turning raw footage into vlogs, tutorials, documentaries and ads for YouTubers, creators and brands."
const SHARE_IMAGE = {
  url: "/og-card-1d2a26e3.jpg", // new name whenever the card changes, so WhatsApp can't reuse an old copy
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Chuloshots — Samuel Anthony, video editor. Every frame earns its place.",
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: SHARE_TITLE,
  description: SHARE_DESCRIPTION,
  applicationName: "Chuloshots",
  openGraph: {
    type: "website",
    siteName: "Chuloshots",
    locale: "en_US",
    url: SITE,
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
  alternates: { canonical: SITE },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0d12",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800&family=Google+Sans+Flex:wght@400..700&family=Geist+Mono:wght@400;500&family=Poppins:wght@500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
