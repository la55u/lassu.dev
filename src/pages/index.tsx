import Head from "next/head";
import { Nav } from "~components/Nav";

import { Scene } from "~components/Scene";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Andras Lassu&apos;s personal website</title>
      </Head>

      <Nav />
      <Scene />
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
