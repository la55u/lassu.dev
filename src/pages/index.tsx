import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { usePhysics } from "src/utils/usePhysics";
import { isatty } from "tty";
import { convertToObject } from "typescript";

export default function Home() {
  usePhysics();
  useTicking();

  return (
    <>
      <Head>
        <title>Andras Lassu&apos;s personal website</title>
      </Head>

      <Content />
      <canvas />
    </>
  );
}

const words = [
  "software engineer",
  "web developer",
  "OSS enthusiast",
  "tinkerer",
  "CSS enjoyer",
  "Javascript wizard",
  "frontend engineer",
  "OSS contributor",
  "creative developer",
  "CS degree owner",
  "Typescript lover",
  "Linux advocate",
  "React developer",
  "React Native developer",
  "team player",
  "Rust learner",
  "wannabe 3D developer",
  "coding mentor",
  "VSCode user",
  "Android user",
  "MTB rider",
  "cat owner",
  "coder",
];

const Content = () => {
  const isAttached = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // subscribe to the `tick` event to change words
  useEffect(() => {
    if (isAttached.current) return;

    document.addEventListener("tick", () => {
      console.log("tick");
      setCurrentIndex((i) => (i + 1) % words.length);
    });
    isAttached.current = true;
  }, []);

  return (
    <div className="page-container">
      <main className="content">
        <h1>Andras Lassu</h1>
        <p>
          Hi, I&apos;m Andras, a{" "}
          <span className="highlight">
            {words[currentIndex]}
            <br />
          </span>
          from Budapest, Hungary and this is my personal website.
        </p>
        <button>DO NOT CLICK ME</button>
      </main>
    </div>
  );
};

function useTicking() {
  const isSet = useRef(false);

  useEffect(() => {
    if (isSet.current) return;

    function fireEvent() {
      // Create a new custom event
      const customEvent = new Event("tick", {
        bubbles: true, // Allow the event to bubble up the DOM hierarchy
        cancelable: true,
      });

      document.dispatchEvent(customEvent);
    }

    const timer = setInterval(() => fireEvent(), 800);

    isSet.current = true;

    // cleanup
    return () => {
      clearInterval(timer);
      isSet.current = false;
    };
  }, []);
}
