import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { facilities, type FacilityStatus } from '../../data/mockData';
import { useSecurityStore } from '../../store/securityStore';

export default function DigitalTwinScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand의 시설 상태 변경 함수 가져옴
  // const updateFacilityStatus = useSecurityStore(
  //   (state) => state.updateFacilityStatus,
  // );

  const facilityStatuses = useSecurityStore((state) => state.facilityStatuses);

  const facilityObjectsRef = useRef(new Map<string, THREE.Mesh>());

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

  // Three.js는 브라우저의 WebGL 환경을 필요로 하기 때문에
  // React가 컴포넌트를 렌더링하는 것과 Three.js의 3D 렌더링 초기화를 분리
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene(3D 세계 자체, 앞으로 만들 건물 경비원 등등이 다 이 안에 들어감)
    const scene = new THREE.Scene();
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
    camera.position.set(5, 5, 8);

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
    const groundGeometry = new THREE.PlaneGeometry(20, 20);

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

    // 6. Building(건물 이게 본론!)
    // 가로 세로 깊이
    // const buildingGeometry = new THREE.BoxGeometry(4, 2, 4);

    // const buildingMaterial = new THREE.MeshStandardMaterial({
    //   color: 0x60a5fa,
    // });

    // const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

    // // 기본적으로 건물 중심은 y=0 이니까 높이가 2면 위아래로 1씩 가기 때문에
    // // y축으로 1 올려줘야 건물의 밑면이 온전히 바닥에서 시작함
    // building.position.y = 1;
    // scene.add(building);

    // 6. Facilities(기존 테스트용 빌딩 말고 실제 시설들 구현)
    // 시설 id로 three.js mesh객체를 맵핑해놓아서 찾는
    // facilityObjects
    // "building-01" → 본관 Mesh
    // "cctv-01"     → 정문 CCTV Mesh
    // "cctv-02"     → 북문 CCTV Mesh
    // "gate-01"     → 정문 Mesh
    // facilityObjects.get("cctv-02")
    // 하면 북문 CCTV의 Three.js Mesh를 바로 찾을 수 있어.

    // const facilityObjects = new Map<string, THREE.Mesh>();

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
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
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

    //useSecurityStore의 시설 선택 함수
    const selectFacility = useSecurityStore.getState().selectFacility;

    const statusLabel = {
      normal: '정상🟢',
      warning: '주의🟡',
      danger: '위험🔴',
    };

    // 시설 상태 변경 함수
    const updateStatus = useSecurityStore.getState().updateFacilityStatus;

    const statusList: FacilityStatus[] = ['normal', 'warning', 'danger'];

    // 시설 상태 5초마다 랜덤 변경(시설도 랜덤 상태도 랜덤)
    const interval = setInterval(() => {
      const randomFacility =
        facilities[Math.floor(Math.random() * facilities.length)];

      const randomStatus =
        statusList[Math.floor(Math.random() * statusList.length)];

      updateStatus(randomFacility.id, randomStatus);

      console.log(
        `[센서 데이터] ${randomFacility.name}: ${statusLabel[randomStatus]}`,
      );
    }, 10000);

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
      const intersects = raycaster.intersectObjects(scene.children);

      // 가장 처음에 닿은 객체에 접근(클릭 시 발동)
      if (intersects.length === 0) return;

      const selectedObject = intersects[0].object;

      // 기존 클릭 시 콘솔 이벤트
      // console.log('선택한 객체:', selectedObject);
      console.log('Facility ID:', selectedObject.userData.facilityId);

      // 이제는 클릭시 store(Zustand)에 ex)selectedFacilityId = "cctv-01" id가 대입됨
      const facilityId = selectedObject.userData.facilityId;
      if (!facilityId) return;
      selectFacility(facilityId);
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

      clearInterval(interval);
    };
  }, []);

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
