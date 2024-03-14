import React from "react";
import styles from "./TextRing.module.css";

export const TextRing = ({ text }: { text: string }) => {
  const chars = text.split("");

  return (
    <div
      className={styles.ring}
      style={{ "--total": chars.length } as React.CSSProperties}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className={styles.char}
          style={{ "--index": i } as React.CSSProperties}
        >
          {c}
        </span>
      ))}
    </div>
  );
};
