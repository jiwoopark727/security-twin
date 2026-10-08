import { create } from 'zustand';
import {
  facilities,
  securityAgents,
  type FacilityStatus,
  type AgentStatus,
} from '../data/mockData';

// 아래 데이터 구조 도식화
// Zustand
// │
// ├── 시설
// │   └── facilityStatuses
// │
// └── 경비 객체
//     ├── agentPositions
//     └── agentStatuses

interface SecurityState {
  selectedFacilityId: string | null;

  facilityStatuses: Record<string, FacilityStatus>;

  agentPositions: Record<
    string,
    {
      x: number;
      y: number;
      z: number;
    }
  >;

  agentStatuses: Record<string, AgentStatus>;

  selectFacility: (facilityId: string) => void;
  clearSelection: () => void;

  updateFacilityStatus: (facilityId: string, status: FacilityStatus) => void;

  updateAgentPosition: (
    agentId: string,
    position: {
      x: number;
      y: number;
      z: number;
    },
  ) => void;

  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
}

const initialFacilityStatuses = Object.fromEntries(
  //각 시설의 현재 상태를 ID로 관리, 상태와 ID를 맵핑하니까
  facilities.map((facility) => [facility.id, facility.status]),
) as Record<string, FacilityStatus>;

const initialAgentPositions = Object.fromEntries(
  securityAgents.map((agent) => [agent.id, agent.position]),
) as Record<
  string,
  {
    x: number;
    y: number;
    z: number;
  }
>;

const initialAgentStatuses = Object.fromEntries(
  securityAgents.map((agent) => [agent.id, agent.status]),
) as Record<string, AgentStatus>;

export const useSecurityStore = create<SecurityState>((set) => ({
  selectedFacilityId: null,

  facilityStatuses: initialFacilityStatuses,

  agentPositions: initialAgentPositions,

  agentStatuses: initialAgentStatuses,

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

  updateAgentPosition: (agentId, position) => {
    set((state) => ({
      agentPositions: {
        ...state.agentPositions,
        [agentId]: position,
      },
    }));
  },

  updateAgentStatus: (agentId, status) => {
    set((state) => ({
      agentStatuses: {
        ...state.agentStatuses,
        [agentId]: status,
      },
    }));
  },
}));
