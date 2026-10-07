export type FacilityStatus = 'normal' | 'warning' | 'danger';

export type FacilityType = 'building' | 'cctv' | 'gate' | 'guard-post';

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
    status: 'danger',
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
    status: 'warning',
    position: {
      x: -5,
      y: 0.5,
      z: 5,
    },
  },
];
