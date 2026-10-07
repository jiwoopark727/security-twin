import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function DigitalTwinScene() {
  const containerRef = useRef<HTMLDivElement>(null);

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
    const groundGeometry = new THREE.PlaneGeometry(25, 25);

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
    const buildingGeometry = new THREE.BoxGeometry(4, 2, 4);

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
    });

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

    // 기본적으로 건물 중심은 y=0 이니까 높이가 2면 위아래로 1씩 가기 때문에
    // y축으로 1 올려줘야 건물이 온전히 바닥에서 시작함
    building.position.y = 1;
    scene.add(building);

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
    };
  }, []);

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
