export type FacilityStatus = 'normal' | 'warning' | 'danger';
export type FacilityType = 'building' | 'cctv' | 'gate' | 'guard-post';
export type AgentType = 'guard' | 'patrol-robot' | 'drone';
export type StrangerType = 'stranger' | 'animal';
// 이것도 사실 위에 처럼 영어 text로만 하고 클라이언트 쪽에서 맵핑해서 뱃지ui 형태로 만드는게 좋긴함
// 하지만 일단 이렇게 그냥 ㄱㄱ
export type AgentStatus =
  | '근무중🟢'
  | '순찰중🔵'
  | '대기🟡'
  | '이상🔴'
  | '대응중🟠'
  | '출동중🟣';
export type SecurityEventType = 'intrusion' | 'fire' | 'equipment';
export type SecurityEventStatus = '발생' | '처리중' | '해결';

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

// 침입자 객체 데이터
export interface Stranger {
  id: string;
  type: StrangerType;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export const strangers: Stranger[] = [
  {
    id: 'stranger-01',
    type: 'stranger',
    position: {
      x: 0,
      y: 0.3,
      z: 5,
    },
  },
];

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  status: SecurityEventStatus;
  position: {
    x: number;
    y: number;
    z: number;
  };
  message: string;
  createdAt: string;
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
      x: 2.3,
      y: 1.6,
      z: 2.3,
    },
  },
  {
    id: 'cctv-02',
    name: '북문 CCTV',
    type: 'cctv',
    status: 'normal',
    position: {
      x: -2.3,
      y: 1.6,
      z: -2.3,
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
      x: -4,
      y: 0.3,
      z: 5,
    },
  },
  {
    id: 'robot-01',
    name: '순찰 로봇',
    type: 'patrol-robot',
    status: '순찰중🔵',
    position: {
      x: 3,
      y: 0.65,
      z: -3,
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

// 테스트용 침입 이벤트 하나 설정함
// ------------ 지금까지는 -------------
// 시설 → 상태
// 로봇 → 상태 / 위치
// ------------   이제는   -------------
// 현실에서 발생한 사건
//         ↓
// Security Event
//         ↓
// 시설/센서 상태 변화
//         ↓
// 경비 객체의 대응
// 이라는 흐름을 만들 수 있음
// 이게 디지털 트윈에서 단순히 3D 모델을 보여주는 것과 모니터링 시스템의 차이

const now: Date = new Date();

const year: number = now.getFullYear(); // 연도 (예: 2026)
const month: string = String(now.getMonth() + 1).padStart(2, '0'); // 월 (0~11로 반환되므로 +1 필수)
const date: string = String(now.getDate()).padStart(2, '0'); // 일

const hours: string = String(now.getHours()).padStart(2, '0'); // 시
const minutes: string = String(now.getMinutes()).padStart(2, '0'); // 분
const seconds: string = String(now.getSeconds()).padStart(2, '0'); // 초

// YYYY-MM-DD HH:mm:ss 포맷팅
const formattedDate: string = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

export const securityEvents: SecurityEvent[] = [
  {
    id: 'event-01',
    type: 'intrusion',
    status: '발생',
    position: {
      x: 0,
      y: 0.3,
      z: 5,
    },
    message: '정문 인근에서 미인가 객체가 감지되었습니다.',
    createdAt: formattedDate,
  },
];
