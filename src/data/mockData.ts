export type FacilityStatus = 'normal' | 'warning' | 'danger';
export type FacilityType = 'building' | 'cctv' | 'gate' | 'guard-post';
export type AgentType = 'guard' | 'patrol-robot' | 'drone';
// 이것도 사실 위에 처럼 영어 text로만 하고 클라이언트 쪽에서 맵핑해서 뱃지ui 형태로 만드는게 좋긴함
// 하지만 일단 이렇게 그냥 ㄱㄱ
export type AgentStatus = '근무중🟢' | '순찰중🔵' | '대기🟡' | '이상🔴';

// 시설물 객체 데이터
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// 경비 객체 데이터
export interface SecurityAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export const facilities: Facility[] = [
  {
    id: 'building-01',
    name: '본관',
    type: 'building',
    status: 'normal',
    position: {
      x: 0,
      y: 1,
      z: 0,
    },
  },
  {
    id: 'cctv-01',
    name: '정문 CCTV',
    type: 'cctv',
    status: 'normal',
    position: {
      x: 3,
      y: 1,
      z: 3,
    },
  },
  {
    id: 'cctv-02',
    name: '북문 CCTV',
    type: 'cctv',
    status: 'normal',
    position: {
      x: -3,
      y: 1,
      z: -3,
    },
  },
  {
    id: 'gate-01',
    name: '정문',
    type: 'gate',
    status: 'normal',
    position: {
      x: 0,
      y: 0.5,
      z: 6,
    },
  },
  {
    id: 'guard-post-01',
    name: '경비 초소',
    type: 'guard-post',
    status: 'normal',
    position: {
      x: -5,
      y: 0.5,
      z: 5,
    },
  },
];

export const securityAgents: SecurityAgent[] = [
  {
    id: 'guard-01',
    name: '경비원',
    type: 'guard',
    status: '근무중🟢',
    position: {
      x: -5,
      y: 0.6,
      z: 4.5,
    },
  },
  {
    id: 'robot-01',
    name: '순찰 로봇',
    type: 'patrol-robot',
    status: '순찰중🔵',
    position: {
      x: -2,
      y: 0.3,
      z: 2,
    },
  },
  {
    id: 'drone-01',
    name: '드론',
    type: 'drone',
    status: '대기🟡',
    position: {
      x: 0,
      y: 5,
      z: -2,
    },
  },
];
