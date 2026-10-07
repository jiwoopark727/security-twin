import { create } from 'zustand';

interface SecurityState {
  selectedFacilityId: string | null;
  selectFacility: (facilityId: string) => void;
  clearSelection: () => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  selectedFacilityId: null,

  selectFacility: (facilityId) => {
    set({
      selectedFacilityId: facilityId,
    });
  },

  clearSelection: () => {
    set({
      selectedFacilityId: null,
    });
  },
}));
