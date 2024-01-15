import { create } from "zustand";

const DEFAULT_FORCE = -40;
const DEFAULT_GRAVITY = -9.81;
const STRONG_GRAVITY = 40;

interface Store {
  /** The force applied to each ball */
  force: number;
  gravity: number;

  setForce: (f: number) => void;
  resetForce: () => void;
  setStrongGravity: () => void;
  resetGravity: () => void;
}

export const useSceneStore = create<Store>()((set) => ({
  force: DEFAULT_FORCE,
  gravity: DEFAULT_GRAVITY,

  setForce: (f) => set({ force: f }),
  resetForce: () => set({ force: DEFAULT_FORCE }),
  setStrongGravity: () => set({ gravity: STRONG_GRAVITY }),
  resetGravity: () => set({ gravity: DEFAULT_GRAVITY }),
}));
