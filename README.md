# Security Twin — 3D 디지털 트윈 기반 경비안전 모니터링 시스템

Three.js 기반의 웹 디지털 트윈 클라이언트로, 가상의 경비 시설과 경비 객체를 3D 공간에 구현하고 시설 상태 모니터링 및 침입 이벤트 대응 과정을 시뮬레이션하는 프로젝트입니다.

## 1. 프로젝트 소개

### 개발 배경

프론트엔드 GIS 개발자 채용공고에서 React와 TypeScript 기반 개발 역량을 확인하고, 웹 기반 디지털 트윈 클라이언트 개발에 필요한 3D 시각화 기술을 직접 경험하기 위해 프로젝트를 진행했습니다.

관련 연구개발 과제를 조사하면서 과학기술정보통신부 주관 국가연구개발사업인 **「지능형 유무인 복합 경비안전 기술개발」** 과제와 AI 기반 비인가 비행체 탐지·인식·추적 기술 개발 관련 내용을 확인했습니다.

면접 준비 기간 내에 AI 탐지 모델이나 실제 장비 연동까지 구현하기에는 한계가 있다고 판단했습니다. 이에 장비·인원·공간이 통합된 경비안전 환경을 구성하고, **시설물과 경비 객체의 상태를 시각화하며 보안 이벤트 대응 과정을 확인할 수 있는 디지털 트윈 클라이언트**를 구현하는 데 집중했습니다.

### 프로젝트 목표

- Three.js를 활용한 3D 경비 시설 및 객체 시각화
- 시설물과 경비 객체의 상태를 연동하는 모니터링 기능 구현
- 객체 선택과 상세 정보 패널을 통한 직관적인 관제 UI 구성
- 침입 이벤트 발생부터 순찰 로봇의 출동·대응·해결까지의 시뮬레이션 구현

## 2. 주요 기능

### 3D 디지털 트윈 공간

- Three.js를 활용한 시설물 및 경비 객체 렌더링
- 카메라 조작을 통한 3D 공간 탐색
- GLB/GLTF 모델을 적용해 기본 도형 중심의 객체를 로우폴리 3D 모델로 교체

### 객체 선택 및 모니터링 패널

- 3D 공간에서 시설물과 경비 객체 선택
- 선택한 객체의 상세 정보와 상태를 모니터링 패널에 표시
- Zustand를 통한 선택 상태 관리
- 선택한 객체 아래 파란색 링을 표시해 현재 선택 대상을 시각적으로 강조

### 시설물 상태 변화 시각화

- 시설물 상태에 따른 객체 색상 변경
- 정상·주의·위험 상태를 색상으로 구분
- 일정 간격으로 시설물 상태가 변경되는 상황을 연출
- 상태 변경을 3D 공간과 모니터링 UI에 반영

### 보안 이벤트 대응 시뮬레이션

1. 침입 이벤트 발생
2. 관련 시설물의 위험 상태 표시
3. 순찰 로봇의 이벤트 발생 지점 출동
4. 현장 도착 후 대응 상태 전환
5. 일정 시간 경과 후 이벤트 해결 처리
6. 순찰 로봇의 순찰 경로 복귀

> 본 프로젝트는 가상 데이터 기반의 시뮬레이션입니다. 실제 CCTV·경비 장비 연동, AI 기반 침입 탐지 및 비인가 비행체 추적 기능은 구현 범위에 포함하지 않았습니다.

## 3. 기술 스택

| 구분         | 기술              |
| ------------ | ----------------- |
| UI           | React, TypeScript |
| 개발 환경    | Vite              |
| 3D 시각화    | Three.js          |
| 3D 모델 로딩 | GLTFLoader        |
| 상태 관리    | Zustand           |
| 스타일링     | Tailwind CSS      |

## 4. 아키텍처 및 주요 구현

### 3D 객체와 상태 관리 연동

Three.js의 3D 객체와 Zustand의 애플리케이션 상태를 연동했습니다.

- `facilityObjectsRef`: 시설물 3D 객체 참조 관리
- `agentObjectsRef`: 경비 객체 3D 객체 참조 관리
- Zustand: 선택 객체, 시설물 상태, 경비 객체의 위치와 상태, 보안 이벤트 상태 관리

3D 객체의 위치나 상태가 변경되면 해당 정보를 상태 저장소에 반영하고, 모니터링 패널에서 현재 상태를 확인할 수 있도록 구성했습니다.

### 객체 선택과 Raycaster

Three.js의 `Raycaster`를 활용해 마우스로 클릭한 3D 객체를 판별하고, 객체에 저장된 ID를 기반으로 Zustand의 선택 상태를 변경했습니다.

선택된 객체는 모니터링 패널에 정보를 표시하고, 3D 공간에서는 바닥 링을 통해 선택 상태를 시각화합니다.

### GLB 모델 적용

기본 `Mesh` 도형 대신 외부 GLB 모델을 불러와 3D 공간에 배치했습니다.

`GLTFLoader`를 사용해 모델을 비동기적으로 로딩하고, 로딩된 객체를 기존 객체 참조 맵에 등록해 이동·선택·상태 관리 기능을 유지했습니다.

## 동작 화면 스크린샷

<table>
  <tr>
    <td align="center">
      <p><홈(초기) 화면></p>
      <img src="https://raw.githubusercontent.com/jiwoopark727/security-twin/main/public/screenshot/11.png" height="500" alt="순찰 로봇 선택 화면">
    </td>
    <td align="center">
      <p><재료 화면></p>
      <img src="https://raw.githubusercontent.com/jiwoopark727/security-twin/main/public/screenshot/22.png" height="500" alt="침임 이벤트 대응 화면">
    </td>
    <td align="center">
      <p><레시피 리스트 화면></p>
      <img src="https://raw.githubusercontent.com/jiwoopark727/security-twin/main/public/screenshot/33.png" height="500" alt="이벤트 해결 처리 완료 화면">
    </td>
  </tr>
  <tr>
    <td align="center">
      <p><레시피 디테일 화면></p>
      <img src="https://raw.githubusercontent.com/jiwoopark727/security-twin/main/public/screenshot/44.png" height="500" alt="본관 빌딩 선택 화면">
    </td>
    <td align="center">
      <p><레시피 디테일2 화면></p>
      <img src="https://raw.githubusercontent.com/jiwoopark727/security-twin/main/public/screenshot/55.png" height="500" alt="경비 초소 선택 화면">
    </td>
  </tr>
</table>

<br/>

## 5. 개발 중 발생한 문제와 해결 과정

### 5-1. 선택 상태가 변경되어도 바닥 링이 갱신되지 않는 문제

**문제**

객체를 선택해 Zustand의 선택 상태가 변경되었지만, 애니메이션 루프에서 바닥 링이 선택된 객체를 제대로 따라가지 않는 문제가 발생했습니다.

**원인**

선택 링을 업데이트하는 애니메이션 루프에서 최신 Zustand 상태를 읽지 않고, 이전에 캡처된 상태를 참조하는 문제가 있었습니다.

**해결**

애니메이션 루프에서 `useSecurityStore.getState()`를 호출해 최신 선택 상태를 직접 읽도록 수정했습니다.

```tsx
const { selectedFacilityId, selectedAgentId } = useSecurityStore.getState();
```

이후 최신 선택 ID를 기준으로 객체를 찾아 링의 위치와 크기를 갱신하도록 구현했습니다.

**배운 점**

React의 렌더링 상태와 Three.js의 지속적인 애니메이션 루프는 실행 방식이 다릅니다. 프레임 단위로 최신 상태를 확인해야 하는 상황에서는 상태를 읽는 시점과 방식을 명확하게 구분해야 합니다.

### 5-2. 객체를 선택할 때마다 순찰 로봇의 경로가 초기화되는 문제

**문제**

시설물이나 경비 객체를 선택할 때마다 순찰 로봇이 진행 중이던 경로를 이어가지 않고 첫 번째 코너부터 다시 순찰하는 문제가 발생했습니다.

**원인**

선택 상태가 변경되면서 React가 다시 렌더링되고, 순찰 이동 `useEffect`가 재실행되는 과정에서 경로 인덱스를 관리하는 변수가 초기화되었습니다. 또한 컴포넌트 내부에서 경로 배열을 새로 생성하면 배열 참조가 변경되어 Effect가 다시 실행될 수 있었습니다.

**해결**

- 현재 순찰 목표 인덱스를 `useRef`로 관리해 Effect가 재실행되어도 경로 진행 상태를 유지했습니다.
- 순찰 경로 배열을 컴포넌트 외부의 상수로 분리해 참조가 불필요하게 변경되지 않도록 했습니다.
- Effect의 의존성 배열을 점검해 필요한 상태 변경에만 이동 로직이 재실행되도록 조정했습니다.

**배운 점**

`useEffect`의 재실행 조건과 지역 변수의 생명주기를 이해하고, 렌더링 사이에도 유지되어야 하는 값은 `useRef`로 관리해야 한다는 점을 학습했습니다.

### 5-3. 보안 이벤트 대응 상태가 변경된 후 해결 처리 타이머가 동작하지 않는 문제

**문제**

순찰 로봇이 침입 지점에 도착해 대응 상태로 변경되었지만, 일정 시간이 지나도 이벤트 해결 버튼이 활성화되지 않는 문제가 발생했습니다.

**원인**

`useEffect`의 의존성 배열에 경비 객체 전체 상태를 기준으로 한 값을 사용하면서, 실제로 확인해야 하는 순찰 로봇의 상태 변경을 명확하게 추적하지 못했습니다.

**해결**

순찰 로봇의 상태만 별도로 구독하도록 수정했습니다.

```tsx
const robotStatus = useSecurityStore(
  (state) => state.agentStatuses['robot-01'],
);
```

이후 해당 `robotStatus`를 `useEffect`의 의존성 배열에 추가해 로봇 상태가 변경될 때 관련 로직이 다시 실행되도록 했습니다.

**배운 점**

상태 관리 라이브러리에서 필요한 상태만 선택적으로 구독하면 Effect의 실행 조건을 명확하게 만들 수 있고, 불필요한 의존성으로 인한 문제도 줄일 수 있습니다.

### 5-4. GLB 모델을 클릭해도 선택 패널과 바닥 링이 표시되지 않는 문제

**문제**

기본 도형을 사용했을 때는 정상적으로 동작하던 객체 선택 기능이 GLB 모델로 교체한 후에는 작동하지 않았습니다.

**원인**

기존 클릭 처리 코드는 Raycaster가 반환한 첫 번째 객체에서 바로 `userData.agentId` 또는 `userData.facilityId`를 확인했습니다. 그러나 GLB 모델은 상위 `Group` 아래에 여러 하위 `Mesh`가 존재할 수 있으므로, 실제 클릭한 하위 객체에는 ID가 없을 수 있었습니다.

**해결**

하위 객체까지 재귀적으로 탐색하고, 클릭한 객체부터 부모 객체 방향으로 ID를 찾도록 수정했습니다.

```tsx
const intersects = raycaster.intersectObjects(scene.children, true);

if (intersects.length === 0) return;

let selectedObject: THREE.Object3D | null = intersects[0].object;

while (selectedObject) {
  const { agentId, facilityId } = selectedObject.userData;

  if (agentId) {
    selectAgent(agentId);
    return;
  }

  if (facilityId) {
    selectFacility(facilityId);
    return;
  }

  selectedObject = selectedObject.parent;
}
```

또한 `agentObjectsRef`의 타입을 `THREE.Mesh`에서 `THREE.Object3D`로 확장해 기본 도형과 GLB 모델의 루트 객체를 함께 관리할 수 있도록 했습니다.

**배운 점**

GLB 모델은 단일 Mesh와 동일한 구조라고 가정할 수 없습니다. 3D 모델의 계층 구조를 고려해 객체 선택 및 참조 관리 로직을 설계해야 합니다.

### 5-5. GLB 모델 로딩 전에 순찰 이동 로직이 실행되는 문제

**문제**

순찰 로봇 모델은 화면에 표시되지만, 최초 실행 시에는 순찰 경로를 따라 이동하지 않았습니다. 침입 이벤트를 발생시키면 이동이 시작되는 현상이 있었습니다.

**원인**

GLB 모델은 비동기로 로딩되므로 순찰 이동 `useEffect`가 실행되는 시점에 `agentObjectsRef`에 로봇 객체가 등록되지 않았을 수 있습니다.

**해결**

모델 로딩 완료 여부를 `agentsReady` 상태로 관리하고, 로딩 완료 후 순찰 이동 Effect가 다시 실행되도록 의존성 배열을 수정했습니다.

**배운 점**

비동기 리소스 로딩과 애니메이션 로직의 실행 순서를 고려해야 합니다. 화면에 모델이 표시되는 것과 해당 모델을 참조하는 로직이 준비된 것은 별개의 문제입니다.

## 6. 프로젝트를 통해 배운 점

- React의 렌더링 주기와 Three.js 애니메이션 루프 사이의 상태 동기화
- Zustand 상태 구독 및 `useEffect` 의존성 관리
- `useRef`를 활용한 애니메이션 진행 상태 유지
- Raycaster와 3D 객체 계층 구조를 활용한 선택 처리
- GLTFLoader를 통한 외부 3D 모델 로딩 및 기존 로직과의 통합
- 가상 이벤트의 상태 전이를 설계하고 UI와 3D 공간에 반영하는 방법

## 7. 3D 모델 출처

- 순찰 로봇: **Generic Robo dude** — Erik Buchholtz, Poly Pizza, CC-BY
- 정문: **Castle Gate** — Quaternius
- 본관: **Large Building** — Kenney

각 모델의 원본 페이지 및 라이선스 조건을 확인하고, 필요한 출처 표기 조건을 준수합니다.

## 8. 향후 개선 방향

- 실제 GIS 데이터와 공간 좌표를 연동한 시설 배치
- 실제 장비 또는 API와의 연동을 고려한 상태 데이터 구조 개선
- 보안 이벤트 이력 및 발생 현황 시각화
- 다수 객체의 상태 업데이트와 3D 렌더링 성능 최적화
- 실제 탐지 시스템과 연계할 수 있는 이벤트 입력 인터페이스 설계
