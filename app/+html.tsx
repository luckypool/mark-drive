import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Meta Tags */}
        <title>MarkDrive - Beautiful Markdown Viewer for Google Drive</title>
        <meta name="title" content="MarkDrive - Beautiful Markdown Viewer for Google Drive" />
        <meta name="description" content="A privacy-first Markdown viewer for Google Drive. Syntax highlighting, Mermaid diagrams, PDF export — all rendered in your browser with zero server storage. Free and open source." />
        <meta name="author" content="luckypool" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="canonical" href="https://mark-drive.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mark-drive.com/" />
        <meta property="og:site_name" content="MarkDrive" />
        <meta property="og:title" content="MarkDrive - Beautiful Markdown Viewer for Google Drive" />
        <meta property="og:description" content="A privacy-first Markdown viewer for Google Drive. Syntax highlighting, Mermaid diagrams, PDF export — all rendered in your browser with zero server storage." />
        <meta property="og:image" content="https://mark-drive.com/og-image.png" />
        <meta property="og:image:alt" content="MarkDrive — Beautiful Markdown Viewer for Google Drive" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mark-drive.com/" />
        <meta name="twitter:title" content="MarkDrive - Beautiful Markdown Viewer for Google Drive" />
        <meta name="twitter:description" content="Privacy-first Markdown viewer for Google Drive. Syntax highlighting, Mermaid diagrams, PDF export — free and open source." />
        <meta name="twitter:image" content="https://mark-drive.com/og-image.png" />

        {/* Apple PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MarkDrive" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YKEK6L4D33" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-YKEK6L4D33');` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0a0b14;
  }
}`;
