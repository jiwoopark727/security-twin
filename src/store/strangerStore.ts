import { create } from 'zustand';

interface StrangerStore {
  strangerOnOff: boolean;
  strangerOn: () => void;
  strangerOff: () => void;
}

export const useStrangerStore = create<StrangerStore>((set) => ({
  strangerOnOff: false,

  strangerOn: () =>
    set(() => ({
      strangerOnOff: true,
    })),

  strangerOff: () =>
    set(() => ({
      strangerOnOff: false,
    })),
}));
