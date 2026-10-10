import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  facilities,
  securityAgents,
  strangers,
  type Stranger,
  type FacilityStatus,
  type SecurityAgent,
} from '../../data/mockData';
import { useSecurityStore } from '../../store/securityStore';
import { useStrangerStore } from '../../store/strangerStore';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
const PATROL_PATH = [
  { x: 3, y: 0.65, z: -3 },
  { x: 3, y: 0.65, z: 3 },
  { x: -3, y: 0.65, z: 3 },
  { x: -3, y: 0.65, z: -3 },
] as const;

export default function DigitalTwinScene() {
  // 순찰로봇 glb 모델 로딩 완료 체크를 위해
  const [agentsReady, setAgentsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand의 시설 상태 변경 함수 가져옴
  // const updateFacilityStatus = useSecurityStore(
  //   (state) => state.updateFacilityStatus,
  // );

  const facilityStatuses = useSecurityStore((state) => state.facilityStatuses);

  const activeSecurityEvent = useSecurityStore(
    (state) => state.activeSecurityEvent,
  );

  const updateAgentPosition = useSecurityStore(
    (state) => state.updateAgentPosition,
  );

  const strangerOnOff = useStrangerStore((state) => state.strangerOnOff);

  // // 로봇 순찰 경로 지정(본관 주위 한바퀴로)
  // const patrolPath = [
  //   { x: 3, y: 0.2, z: -3 },
  //   { x: 3, y: 0.2, z: 3 },
  //   { x: -3, y: 0.2, z: 3 },
  //   { x: -3, y: 0.2, z: -3 },
  // ];

  // useRef를 쓰는 이유는 리렌더링을 유발하지 않으면서 데이터와
  // 객체 인스턴슬를 유지하고 직접 조작하기 위함 useState면 계속 리렌더링 되니까
  // 시설객체저장
  const facilityObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // 경비객체 저장(glb 파일로 바꾸기 위해 mesh를 Object3D로 바꿈ㅎ)
  const agentObjectsRef = useRef(new Map<string, THREE.Object3D>());

  // 침입자객체
  const strangerObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // 선택 표시용 링 객체
  const selectionIndicatorRef = useRef<THREE.Mesh | null>(null);

  // 시설 종류에 따른 기본 색상과 상태에 따른 색상을 분리
  // store에 데이터가 있고 three.js가 이 데이터를 받아서 3d 객체 색상 표현
  const getStatusColor = (status: FacilityStatus) => {
    switch (status) {
      case 'normal':
        return 0x22c55e;

      case 'warning':
        return 0xfacc15;

      case 'danger':
        return 0xef4444;

      default:
        return 0xffffff;
    }
  };

  const createAgentMesh = (agentType: SecurityAgent['type']) => {
    let geometry: THREE.BufferGeometry;

    switch (agentType) {
      case 'guard':
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 5);
        break;

      case 'drone':
        geometry = new THREE.SphereGeometry(0.4, 16, 16);
        break;

      case 'patrol-robot':
        // geometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        // break;
        return null;
    }

    // const material = new THREE.MeshStandardMaterial({
    //   color:
    //     agentType === 'guard'
    //       ? 0x3b82f6
    //       : agentType === 'patrol-robot'
    //         ? 0x8b5cf6
    //         : 0xff00ff,
    // });
    const material = new THREE.MeshStandardMaterial({
      color: agentType === 'guard' ? 0x3b82f6 : 0xff00ff,
    });

    return new THREE.Mesh(geometry, material);
  };

  const createStrangerMesh = (strangerType: Stranger['type']) => {
    let geometry: THREE.BufferGeometry;

    switch (strangerType) {
      case 'stranger':
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 5);
        break;

      case 'animal':
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 5);
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color:
        strangerType === 'stranger'
          ? 0x000000
          : strangerType === 'animal'
            ? 0xffffff
            : 0xffc0cb,
    });

    return new THREE.Mesh(geometry, material);
  };

  const sceneRef = useRef<THREE.Scene | null>(null);

  // Three.js는 브라우저의 WebGL 환경을 필요로 하기 때문에
  // React가 컴포넌트를 렌더링하는 것과 Three.js의 3D 렌더링 초기화를 분리
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene(3D 세계 자체, 앞으로 만들 건물 경비원 등등이 다 이 안에 들어감)
    const scene = new THREE.Scene();
    // 침입자 객체 on/off 할때 사용하게
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x111827);

    // 2. Camera(시점 역할)
    // 카메라 속성 설정
    const camera = new THREE.PerspectiveCamera(
      100,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );

    // 카메라가 바라보는 위치 설정
    camera.position.set(3, 6, 6);

    // 3. Renderer(Scene과 Camera의 객체 데이터를 넘겨받아 카메라가 비추는 3D 공간을 2차원
    // 평면 이미지로 그려서 웹페이지 HTML <canvas> 요소에 출력하는 핵심 객체
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    // 4. Light
    // 주변 전체를 균일하게 밝히는 조명(색상, 밝기)
    // AmbientLight는 특정 방향에서 빛을 비추는 게 아니라 모든 물체를 전체적으로 밝게 만듦.
    // 그래서 이것만 있으면 그림자나 입체감이 거의 없다
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // 특정방향에서 들어오는 빛
    // AmbientLight와 다르게 방향이 있기 때문에 건물의 어느 면이 밝고 어느 면이 어두운지가 생김
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // 5. Ground(바닥)
    // 바닥 가로세로
    const groundGeometry = new THREE.PlaneGeometry(14, 14);

    //바닥 재질, 모양, 색상 이런거
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
    });

    // 실제로 화면에 보이는 3D 객체는 보통 Geometry + Meterial = Mesh
    // 따라서 Mesh화 해서 ground 객체에 대입
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    // PlaneGeometry는 기본적으로 xy 평면 but 우리는 바닥을 만들어야하니 xz 평면
    // 그래서 x축을 기준으로 -90도 회전시켜서 바닥처럼 눕히는거
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 시설 데이터와 3D Object 들을 연결
    facilities.forEach((facility) => {
      // 본관 GLB 모델 로드
      if (facility.id === 'building-01') {
        const loader = new GLTFLoader();

        loader.load(
          '/models/building-01.glb',
          (gltf) => {
            const object = gltf.scene;

            object.position.set(
              facility.position.x,
              facility.position.y,
              facility.position.z,
            );

            object.userData = {
              facilityId: facility.id,
            };

            // 본관 스케일 조정 필요할때 주석 풀기
            object.scale.set(2, 1.8, 5);

            facilityObjectsRef.current.set(facility.id, object);
            scene.add(object);
          },
          undefined,
          (error) => {
            console.error('본관 GLB 모델 로드 실패:', error);
          },
        );

        return;
      }

      // 기존 정문 GLB 모델 로드
      if (facility.type === 'gate') {
        const loader = new GLTFLoader();

        loader.load(
          '/models/gate-01.glb',
          (gltf) => {
            const object = gltf.scene;

            object.position.set(
              facility.position.x,
              facility.position.y,
              facility.position.z,
            );

            object.userData = {
              facilityId: facility.id,
            };

            object.scale.set(2, 1, 2);

            facilityObjectsRef.current.set(facility.id, object);
            scene.add(object);
          },
          undefined,
          (error) => {
            console.error('정문 GLB 모델 로드 실패:', error);
          },
        );

        return;
      }

      // 아래는 기존 시설물 생성 코드 유지
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;

      switch (facility.type) {
        case 'building':
          geometry = new THREE.BoxGeometry(4, 2, 4);
          material = new THREE.MeshStandardMaterial({
            color: getStatusColor(facility.status),
          });
          break;

        case 'cctv':
          geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16);
          material = new THREE.MeshStandardMaterial({
            color: getStatusColor(facility.status),
          });
          break;

        case 'guard-post':
          geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
          material = new THREE.MeshStandardMaterial({
            color: getStatusColor(facility.status),
          });
          break;

        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          material = new THREE.MeshStandardMaterial({
            color: getStatusColor(facility.status),
          });
      }

      const object = new THREE.Mesh(geometry, material);

      object.position.set(
        facility.position.x,
        facility.position.y,
        facility.position.z,
      );

      object.userData = {
        facilityId: facility.id,
      };

      facilityObjectsRef.current.set(facility.id, object);
      scene.add(object);
    });

    // // 경비 객체 씬에 추가
    // securityAgents.forEach((agent) => {
    //   const mesh = createAgentMesh(agent.type);

    //   mesh.position.set(agent.position.x, agent.position.y, agent.position.z);

    //   mesh.userData.agentId = agent.id;

    //   scene.add(mesh);

    //   agentObjectsRef.current.set(agent.id, mesh);
    // });

    // 경비 객체 씬에 추가
    securityAgents.forEach((agent) => {
      // 순찰로봇이면~ glb 파일로 로드 하겠다는거지
      if (agent.type === 'patrol-robot') {
        const loader = new GLTFLoader();

        loader.load(
          '/models/patrol-robot.glb',
          (gltf) => {
            const model = gltf.scene;

            model.position.set(
              agent.position.x,
              agent.position.y,
              agent.position.z,
            );

            model.scale.setScalar(1);

            model.userData.agentId = agent.id;

            scene.add(model);

            agentObjectsRef.current.set(agent.id, model);

            setAgentsReady(true);
          },
          undefined,
          (error) => {
            console.error('순찰 로봇 모델 로딩 실패:', error);
          },
        );

        return;
      }

      const mesh = createAgentMesh(agent.type);

      if (!mesh) return;

      mesh.position.set(agent.position.x, agent.position.y, agent.position.z);

      mesh.userData.agentId = agent.id;

      scene.add(mesh);

      agentObjectsRef.current.set(agent.id, mesh);
    });

    //useSecurityStore의 시설 선택 함수
    const selectFacility = useSecurityStore.getState().selectFacility;

    const selectAgent = useSecurityStore.getState().selectAgent;

    // 이거 다시 주석 지울 때 밑에 clean(Interval) 도 잊지말고 주석 빼줘야함!!
    // 시설 상태 변경 함수
    const updateStatus = useSecurityStore.getState().updateFacilityStatus;

    const statusList: FacilityStatus[] = ['normal', 'warning', 'danger'];

    // 시설 상태 10초마다 랜덤 변경(시설도 랜덤 상태도 랜덤)
    const interval = setInterval(() => {
      const randomFacility =
        facilities[Math.floor(Math.random() * facilities.length)];

      const randomStatus =
        statusList[Math.floor(Math.random() * statusList.length)];

      updateStatus(randomFacility.id, randomStatus);

      console.log(`[센서 데이터] ${randomFacility.name}: ${randomStatus}`);
    }, 10000);

    // Raycaster 설정
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // const handleClick = (event: MouseEvent) => {
    //   if (!containerRef.current) return;

    //   const rect = containerRef.current.getBoundingClientRect();

    //   mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

    //   mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    //   // 카메라와 마우스 좌표를 기반으로 ray 설정
    //   raycaster.setFromCamera(mouse, camera);

    //   // intersects 대상 배열 전달 (scene.children 등)
    //   // 한마디로 클릭 이벤트인거지 three.js 의~
    //   const intersects = raycaster.intersectObjects(scene.children);

    //   // 가장 처음에 닿은 객체에 접근(클릭 시 발동)
    //   if (intersects.length === 0) return;

    //   const selectedObject = intersects[0].object;

    //   console.log(selectedObject.userData);

    //   // 경비 객체 클릭
    //   if (selectedObject.userData.agentId) {
    //     selectAgent(selectedObject.userData.agentId);
    //     return;
    //   }

    //   // 시설 클릭
    //   if (selectedObject.userData.facilityId) {
    //     selectFacility(selectedObject.userData.facilityId);
    //   }
    // };

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // true: 하위 객체까지 재귀적으로 탐색
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) return;

      // 가장 가까운 교차 객체부터 부모 방향으로 탐색
      let selectedObject: THREE.Object3D | null = intersects[0].object;

      while (selectedObject) {
        const { agentId, facilityId } = selectedObject.userData;

        // 경비 객체 클릭
        if (agentId) {
          selectAgent(agentId);
          return;
        }

        // 시설 클릭
        if (facilityId) {
          selectFacility(facilityId);
          return;
        }

        selectedObject = selectedObject.parent;
      }
    };

    //시설 객체 클릭 시 이벤트 등록
    renderer.domElement.addEventListener('click', handleClick);

    // 선택된 객체를 표시할 링 객체
    const selectionGeometry = new THREE.RingGeometry(1.05, 1.2, 48);

    const selectionMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const selectionIndicator = new THREE.Mesh(
      selectionGeometry,
      selectionMaterial,
    );

    // RingGeometry는 기본적으로 XY 평면이므로 바닥에 눕힌다.
    selectionIndicator.rotation.x = -Math.PI / 2;
    selectionIndicator.position.y = 0.04;
    selectionIndicator.visible = false;
    selectionIndicator.renderOrder = 1;

    scene.add(selectionIndicator);
    selectionIndicatorRef.current = selectionIndicator;

    // 7. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 8. Animation
    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      // 선택한 시설이나 경비 객체 위치를 읽고 해당 객체 아래에 링을 이동
      const indicator = selectionIndicatorRef.current;

      if (indicator) {
        const { selectedFacilityId, selectedAgentId } =
          useSecurityStore.getState();

        const selectedObject = selectedFacilityId
          ? facilityObjectsRef.current.get(selectedFacilityId)
          : selectedAgentId
            ? agentObjectsRef.current.get(selectedAgentId)
            : undefined;

        if (selectedObject) {
          indicator.visible = true;

          // 선택한 객체의 X, Z 위치를 따라간다.
          indicator.position.x = selectedObject.position.x;
          indicator.position.z = selectedObject.position.z;
          indicator.position.y = 0.04;

          // 객체 종류에 따라 링 크기를 조정한다.
          let ringScale = 0.7;

          if (selectedFacilityId) {
            const facility = facilities.find(
              (item) => item.id === selectedFacilityId,
            );

            switch (facility?.type) {
              case 'building':
                ringScale = 3;
                break;
              case 'gate':
                ringScale = 1.2;
                break;
              case 'guard-post':
                ringScale = 1.2;
                break;
              case 'cctv':
                ringScale = 0.5;
                break;
            }
          } else if (selectedAgentId) {
            const agent = securityAgents.find(
              (item) => item.id === selectedAgentId,
            );

            switch (agent?.type) {
              case 'guard':
                ringScale = 0.4;
                break;
              case 'patrol-robot':
                ringScale = 0.6;
                break;
              case 'drone':
                ringScale = 0.8;
                break;
            }
          }

          indicator.scale.setScalar(ringScale);
        } else {
          indicator.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      // React 컴포넌트가 사라졌는데 Three.js 리소스가 남아있으면 메모리 누수나
      // 불필요한 리소스 점유 발생 방지 Clean up
      controls.dispose();
      renderer.dispose();
      selectionGeometry.dispose();
      selectionMaterial.dispose();
      selectionIndicatorRef.current = null;

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.domElement.removeEventListener('click', handleClick);

      clearInterval(interval);
    };
  }, []);

  // 상태가 변경될 때마다 시설 객체 색상 변경
  useEffect(() => {
    Object.entries(facilityStatuses).forEach(([facilityId, status]) => {
      const object = facilityObjectsRef.current.get(facilityId);

      if (!object) return;

      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.color.setHex(getStatusColor(status));
          }
        });
      });
    });
  }, [facilityStatuses]);

  // 로봇 순찰 애니메이션 로직
  // 사실 로봇 이동도 setInterval 보다는 이 애니메이션 루프 안에서 처리하는게 three.js 스럽다
  // 즉 이런 구조
  // requestAnimationFrame
  //         ↓
  // 로봇 위치 계산
  //         ↓
  // Scene 렌더링
  // 하지만 지금은 우리가 개념을 배우는 단계니까 일단 setInterval로 구현해보고,
  // 정상적으로 움직이는 걸 확인한 다음 requestAnimationFrame 기반으로 리팩토링하자.
  // 최종 ver. 지금 사각형 경로로 순찰을 돌다가 침입자 발생 시 해당 지점으로 출동
  // 근데 해당 지점으로 일직선 이동하다 보니 건물을 뚫고 가는 문제 발생

  // const resolveSecurityEvent = useSecurityStore(
  //   (state) => state.resolveSecurityEvent,
  // );
  const respondSecurityEvent = useSecurityStore(
    (state) => state.respondSecurityEvent,
  );

  const hasRespondedRef = useRef(false);
  const patrolTargetIndexRef = useRef(1);

  useEffect(() => {
    const robot = agentObjectsRef.current.get('robot-01');

    if (!robot) return;

    const speed = 0.02;
    const arrivalDistance = 0.05;

    // 보안 이벤트 발생했다는겨~
    const isResponding =
      activeSecurityEvent !== null && activeSecurityEvent.status !== '해결';

    const animateRobot = () => {
      // 1. 현재 이동할 목적지 결정
      const target = isResponding
        ? activeSecurityEvent.position
        : PATROL_PATH[patrolTargetIndexRef.current];

      const dx = target.x - robot.position.x;
      const dy = target.y - robot.position.y;
      const dz = target.z - robot.position.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // 2. 목적지에 도착했는지 확인
      // 0.03을 더한 이유는 한 프레임의 0.02의 속도로 이동하는데
      // z=5의 위치에 안착하려면 ㅎㅎ
      if (distance + 0.03 < arrivalDistance) {
        if (isResponding) {
          if (!hasRespondedRef.current) {
            respondSecurityEvent();
            hasRespondedRef.current = true;
          }
        } else {
          patrolTargetIndexRef.current =
            (patrolTargetIndexRef.current + 1) % PATROL_PATH.length;
        }

        return;
      }

      // 3. 목적지 방향으로 조금씩 이동
      const step = Math.min(speed, distance);

      robot.position.x += (dx / distance) * step;
      robot.position.y += (dy / distance) * step;
      robot.position.z += (dz / distance) * step;

      // 4. Zustand에 현재 위치 반영
      updateAgentPosition('robot-01', {
        x: robot.position.x,
        y: robot.position.y,
        z: robot.position.z,
      });
    };

    const interval = setInterval(animateRobot, 16);

    return () => {
      clearInterval(interval);
      //침임 이벤트 발생 버튼을 여러번 누를수도 있기에 hasRespondRef false로 초기화해줘야됨
      hasRespondedRef.current = false;
    };
  }, [
    activeSecurityEvent,
    updateAgentPosition,
    respondSecurityEvent,
    agentsReady,
  ]);

  // 보안 이벤트 상태에 따라 침입자 객체 on/off
  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    if (strangerOnOff) {
      // 침입자 객체 추가
      strangers.forEach((stranger) => {
        if (strangerObjectsRef.current.has(stranger.id)) {
          return;
        }

        const mesh = createStrangerMesh(stranger.type);

        mesh.position.set(
          stranger.position.x,
          stranger.position.y,
          stranger.position.z,
        );

        mesh.userData.stranger = stranger.id;

        scene.add(mesh);

        strangerObjectsRef.current.set(stranger.id, mesh);
      });
    } else {
      // 침입자 객체 제거
      strangerObjectsRef.current.forEach((mesh) => {
        scene.remove(mesh);
      });

      strangerObjectsRef.current.clear();
    }
  }, [strangerOnOff]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
      }}
    />
  );
}
