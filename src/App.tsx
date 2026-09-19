import { Analytics } from "@vercel/analytics/react";
import { lazy, Suspense, useState } from "react";
import { Nav } from "./components/Nav";

const Scene = lazy(() => import("./components/Scene"));

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext && (canvas.getContext("webgl2") ?? canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function App() {
  const [webgl] = useState(hasWebGL);

  return (
    <>
      <h1 className="sr-only">Andras Lassu — Software Engineer</h1>
      <Nav />
      {webgl ? (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      ) : (
        <main className="static-hero">ANDRAS LASSU</main>
      )}
      <Analytics />
    </>
  );
}

export default App;
