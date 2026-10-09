import { useEffect, useRef } from 'react';
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

export default function DigitalTwinScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand의 시설 상태 변경 함수 가져옴
  // const updateFacilityStatus = useSecurityStore(
  //   (state) => state.updateFacilityStatus,
  // );

  const facilityStatuses = useSecurityStore((state) => state.facilityStatuses);
  const updateAgentPosition = useSecurityStore(
    (state) => state.updateAgentPosition,
  );

  const strangerOnOff = useStrangerStore((state) => state.strangerOnOff);

  // 로봇 순찰 경로 지정(본관 주위 한바퀴로)
  const patrolPath = [
    { x: 3, y: 0.2, z: -3 },
    { x: 3, y: 0.2, z: 3 },
    { x: -3, y: 0.2, z: 3 },
    { x: -3, y: 0.2, z: -3 },
  ];

  // useRef를 쓰는 이유는 리렌더링을 유발하지 않으면서 데이터와
  // 객체 인스턴슬를 유지하고 직접 조작하기 위함 useState면 계속 리렌더링 되니까
  // 시설객체저장
  const facilityObjectsRef = useRef(new Map<string, THREE.Mesh>());
  // 경비객체저장
  const agentObjectsRef = useRef(new Map<string, THREE.Mesh>());
  const strangerObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());

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

      case 'patrol-robot':
        geometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        break;

      case 'drone':
        geometry = new THREE.SphereGeometry(0.4, 16, 16);
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color:
        agentType === 'guard'
          ? 0x3b82f6
          : agentType === 'patrol-robot'
            ? 0x8b5cf6
            : 0x06b6d4,
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
    camera.position.set(3, 6, 8);

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
      color: 0x374151,
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

        case 'gate':
          geometry = new THREE.BoxGeometry(3, 1, 0.5);
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

    // 경비 객체 씬에 추가
    securityAgents.forEach((agent) => {
      const mesh = createAgentMesh(agent.type);

      mesh.position.set(agent.position.x, agent.position.y, agent.position.z);

      mesh.userData.agentId = agent.id;

      scene.add(mesh);

      agentObjectsRef.current.set(agent.id, mesh);
    });

    // // 침입자 객체 씬에 추가
    // strangers.forEach((stranger) => {
    //   const mesh = createStrangerMesh(stranger.type);

    //   mesh.position.set(
    //     stranger.position.x,
    //     stranger.position.y,
    //     stranger.position.z,
    //   );

    //   mesh.userData.stranger = stranger.id;

    //   scene.add(mesh);

    //   agentObjectsRef.current.set(stranger.id, mesh);
    // });

    //useSecurityStore의 시설 선택 함수
    const selectFacility = useSecurityStore.getState().selectFacility;

    const selectAgent = useSecurityStore.getState().selectAgent;

    // const statusLabel = {
    //   normal: '정상🟢',
    //   warning: '주의🟡',
    //   danger: '위험🔴',
    // };

    // 이거 다시 주석 지울 때 밑에 clean(Interval) 도 잊지말고 주석 빼줘야함!!
    // // 시설 상태 변경 함수
    // const updateStatus = useSecurityStore.getState().updateFacilityStatus;

    // const statusList: FacilityStatus[] = ['normal', 'warning', 'danger'];

    // // 시설 상태 10초마다 랜덤 변경(시설도 랜덤 상태도 랜덤)
    // const interval = setInterval(() => {
    //   const randomFacility =
    //     facilities[Math.floor(Math.random() * facilities.length)];

    //   const randomStatus =
    //     statusList[Math.floor(Math.random() * statusList.length)];

    //   updateStatus(randomFacility.id, randomStatus);

    //   console.log(
    //     `[센서 데이터] ${randomFacility.name}: ${statusLabel[randomStatus]}`,
    //   );
    // }, 10000);

    // Raycaster 설정
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 카메라와 마우스 좌표를 기반으로 ray 설정
      raycaster.setFromCamera(mouse, camera);

      // intersects 대상 배열 전달 (scene.children 등)
      // 한마디로 클릭 이벤트인거지 three.js 의~
      const intersects = raycaster.intersectObjects(scene.children);

      // 가장 처음에 닿은 객체에 접근(클릭 시 발동)
      if (intersects.length === 0) return;

      const selectedObject = intersects[0].object;

      console.log(selectedObject.userData);

      // 경비 객체 클릭
      if (selectedObject.userData.agentId) {
        selectAgent(selectedObject.userData.agentId);
        return;
      }

      // 시설 클릭
      if (selectedObject.userData.facilityId) {
        selectFacility(selectedObject.userData.facilityId);
      }
    };

    //시설 객체 클릭 시 이벤트 등록
    renderer.domElement.addEventListener('click', handleClick);

    // 7. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 8. Animation
    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

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

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.domElement.removeEventListener('click', handleClick);

      // clearInterval(interval);
    };
  }, []);

  // 상태가 변경될때마다 시설 객체 색상 변경해주는
  useEffect(() => {
    Object.entries(facilityStatuses).forEach(([facilityId, status]) => {
      const object = facilityObjectsRef.current.get(facilityId);

      if (!object) return;

      const material = object.material;

      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.setHex(getStatusColor(status));
      }
    });
  }, [facilityStatuses]);

  useEffect(() => {
    const robot = agentObjectsRef.current.get('robot-01');

    if (!robot) return;

    let currentTargetIndex = 1;

    const speed = 0.02;

    const animatePatrol = () => {
      const target = patrolPath[currentTargetIndex];

      const dx = target.x - robot.position.x;
      const dz = target.z - robot.position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < 0.05) {
        currentTargetIndex = (currentTargetIndex + 1) % patrolPath.length;

        return;
      }

      robot.position.x += (dx / distance) * speed;
      robot.position.z += (dz / distance) * speed;

      updateAgentPosition('robot-01', {
        x: robot.position.x,
        y: robot.position.y,
        z: robot.position.z,
      });
    };

    // 사실 로봇 이동도 setInterval 보다는 이 애니메이션 루프 안에서 처리하는게 three.js 스럽다
    // 즉 이런 구조
    // requestAnimationFrame
    //         ↓
    // 로봇 위치 계산
    //         ↓
    // Scene 렌더링
    // 하지만 지금은 우리가 개념을 배우는 단계니까 일단 setInterval로 구현해보고,
    // 정상적으로 움직이는 걸 확인한 다음 requestAnimationFrame 기반으로 리팩토링하자.
    const interval = setInterval(animatePatrol, 16);

    return () => {
      clearInterval(interval);
    };
  }, [updateAgentPosition]);

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
  }, [strangerOnOff, strangers]);

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
