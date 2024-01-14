import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{"Andras Lassu's personal website"}</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
