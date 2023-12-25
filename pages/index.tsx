import Head from "next/head";
import { usePhysics } from "~utils/usePhysics";

export default function Home() {
  usePhysics();

  return (
    <>
      <Head>
        <title>Andras Lassu&apos;s personal website</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="content">
        <h1>Andras Lassu</h1>
        <p>
          Hi, I&apos;m Andras, a software developer from Budapest, Hungary and this is my
          personal website.
        </p>
        <button>DO NOT CLICK ME&nbsp;&nbsp;•</button>
      </main>

      <canvas />
    </>
  );
}
