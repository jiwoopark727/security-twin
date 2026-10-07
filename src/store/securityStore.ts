import { create } from 'zustand';
import { facilities, type FacilityStatus } from '../data/mockData';

interface SecurityState {
  selectedFacilityId: string | null;

  facilityStatuses: Record<string, FacilityStatus>;

  selectFacility: (facilityId: string) => void;
  clearSelection: () => void;

  updateFacilityStatus: (facilityId: string, status: FacilityStatus) => void;
}

const initialFacilityStatuses = Object.fromEntries(
  //각 시설의 현재 상태를 ID로 관리, 상태와 ID를 맵핑하니까
  facilities.map((facility) => [facility.id, facility.status]),
) as Record<string, FacilityStatus>;

export const useSecurityStore = create<SecurityState>((set) => ({
  selectedFacilityId: null,

  facilityStatuses: initialFacilityStatuses,

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

  updateFacilityStatus: (facilityId, status) => {
    set((state) => ({
      facilityStatuses: {
        ...state.facilityStatuses,
        [facilityId]: status,
      },
    }));
  },
}));
