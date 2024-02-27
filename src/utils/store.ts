import { create } from "zustand";

interface Store {
  nav: string;
  setNav: (elementId: string) => void;
}

export const useGlobalStore = create<Store>()((set) => ({
  nav: "",
  setNav: (elementId) => set({ nav: elementId }),
}));
