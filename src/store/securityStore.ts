import { create } from 'zustand';
import {
  facilities,
  securityAgents,
  type FacilityStatus,
  type AgentStatus,
  type SecurityEvent,
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
  selectedAgentId: string | null;
  // activeSecurityEvent는 현재 처리 중인 이벤트를 보관, 이벤트 없으면 null
  activeSecurityEvent: SecurityEvent | null;

  triggerIntrusion: () => void;
  resolveSecurityEvent: () => void;

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
  clearFacilitySelection: () => void;

  updateFacilityStatus: (facilityId: string, status: FacilityStatus) => void;

  selectAgent: (agentId: string) => void;
  clearAgentSelection: () => void;

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
  selectedAgentId: null,
  activeSecurityEvent: null,

  facilityStatuses: initialFacilityStatuses,

  agentPositions: initialAgentPositions,

  agentStatuses: initialAgentStatuses,

  selectFacility: (facilityId) => {
    set({
      selectedFacilityId: facilityId,
      // 시설을 클릭했는데 기존에 선택되어 있던 로봇도 선택된 상태면 안 되니
      // 그래서 서로 선택을 해제
      selectedAgentId: null,
    });
  },

  clearFacilitySelection: () => {
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

  selectAgent: (agentId) =>
    set({
      selectedAgentId: agentId,
      // 시설을 클릭했는데 기존에 선택되어 있던 로봇도 선택된 상태면 안 되니
      // 그래서 서로 선택을 해제
      selectedFacilityId: null,
    }),

  clearAgentSelection: () =>
    set({
      selectedAgentId: null,
    }),

  triggerIntrusion: () => {
    const event: SecurityEvent = {
      id: `event-${Date.now()}`,
      type: 'intrusion',
      status: '발생',
      position: {
        x: 3,
        y: 0.3,
        z: 2,
      },
      message: '정문 인근에서 미인가 객체가 감지되었습니다.',
      createdAt: new Date().toLocaleTimeString('ko-KR'),
    };

    set((state) => ({
      activeSecurityEvent: event,

      facilityStatuses: {
        ...state.facilityStatuses,
        'cctv-01': 'danger',
      },

      agentStatuses: {
        ...state.agentStatuses,
        'robot-01': '대응중🟠',
      },
    }));
  },

  resolveSecurityEvent: () => {
    set((state) => ({
      activeSecurityEvent: state.activeSecurityEvent
        ? {
            ...state.activeSecurityEvent,
            status: '해결',
          }
        : null,
    }));
  },
}));
