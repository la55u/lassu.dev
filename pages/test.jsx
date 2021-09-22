import React, { useEffect } from "react";
import { init } from "../utils/init";

export default function Demo() {
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div id="stat" />
      <canvas className="webgl" />
    </>
  );
}
