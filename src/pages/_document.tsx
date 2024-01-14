import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const desc = "A demo site to showcase skills and work experience";
  const imgSrc =
    process.env.NODE_ENV === "development"
      ? "http://localhost/og.png"
      : "https://lassu.dev/og.png";

  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#dfdfdf" /> {/* same as canvas bg */}
        <meta name="description" content={desc} />
        <meta property="og:url" content="https://lassu.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Andras Lassu's personal website" />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={imgSrc} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="lassu.dev" />
        <meta property="twitter:url" content="https://lassu.dev" />
        <meta name="twitter:title" content="Andras Lassu's personal website" />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={imgSrc} />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥑</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
