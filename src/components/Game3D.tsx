import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface Game3DProps {
  onGameStateChange: (state: any) => void;
}

const Game3D = ({ onGameStateChange }: Game3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1f2c);
    scene.fog = new THREE.Fog(0x1a1f2c, 50, 200);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const world = new CANNON.World();
    world.gravity.set(0, -20, 0);
    world.defaultContactMaterial.friction = 0.3;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    const streetLight1 = new THREE.PointLight(0x0ea5e9, 1, 30);
    streetLight1.position.set(-15, 8, -15);
    scene.add(streetLight1);

    const streetLight2 = new THREE.PointLight(0xf97316, 1, 30);
    streetLight2.position.set(15, 8, 15);
    scene.add(streetLight2);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape,
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);

    const roadGeometry = new THREE.PlaneGeometry(10, 200);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
    });
    const road1 = new THREE.Mesh(roadGeometry, roadMaterial);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.01;
    road1.receiveShadow = true;
    scene.add(road1);

    const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = Math.PI / 2;
    road2.position.y = 0.01;
    road2.receiveShadow = true;
    scene.add(road2);

    const lineGeometry = new THREE.PlaneGeometry(0.3, 5);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = -90; i < 90; i += 10) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, i);
      scene.add(line);
    }

    const buildings: { mesh: THREE.Mesh; color: number }[] = [];
    const buildingPositions = [
      { x: -30, z: -30, w: 15, h: 25, d: 15, color: 0x2a4858 },
      { x: -30, z: 15, w: 15, h: 20, d: 15, color: 0x3a3858 },
      { x: 15, z: -30, w: 15, h: 30, d: 15, color: 0x4a2838 },
      { x: 15, z: 15, w: 15, h: 18, d: 15, color: 0x2a5848 },
      { x: -60, z: -60, w: 20, h: 35, d: 20, color: 0x2a3858 },
      { x: -60, z: 40, w: 20, h: 28, d: 20, color: 0x4a3848 },
      { x: 40, z: -60, w: 20, h: 32, d: 20, color: 0x3a4858 },
      { x: 40, z: 40, w: 20, h: 22, d: 20, color: 0x2a4848 },
    ];

    buildingPositions.forEach(({ x, z, w, h, d, color }) => {
      const buildingGeometry = new THREE.BoxGeometry(w, h, d);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0.3,
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(x, h / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);
      buildings.push({ mesh: building, color });

      const windowGeometry = new THREE.PlaneGeometry(1, 1);
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.3 ? 0xffdd00 : 0x000000,
      });

      for (let i = 2; i < h - 2; i += 3) {
        for (let j = -w / 2 + 2; j < w / 2 - 2; j += 3) {
          const window1 = new THREE.Mesh(windowGeometry, windowMaterial.clone());
          window1.position.set(x + j, i, z + d / 2 + 0.01);
          scene.add(window1);

          const window2 = new THREE.Mesh(windowGeometry, windowMaterial.clone());
          window2.position.set(x + j, i, z - d / 2 - 0.01);
          scene.add(window2);
        }
      }
    });

    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.5,
      metalness: 0.5,
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 2, 0);
    player.castShadow = true;
    scene.add(player);

    const playerShape = new CANNON.Cylinder(0.5, 0.5, 2.5, 8);
    const playerBody = new CANNON.Body({
      mass: 70,
      shape: playerShape,
      linearDamping: 0.9,
      angularDamping: 0.99,
      fixedRotation: true,
    });
    playerBody.position.set(0, 2, 0);
    world.addBody(playerBody);

    const keys: { [key: string]: boolean } = {};
    let isJumping = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space' && !isJumping) {
        playerBody.velocity.y = 10;
        isJumping = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let cameraAngle = 0;
    let cameraDistance = 15;

    const handleWheel = (e: WheelEvent) => {
      cameraDistance += e.deltaY * 0.01;
      cameraDistance = Math.max(5, Math.min(30, cameraDistance));
    };

    window.addEventListener('wheel', handleWheel);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    const playerHealth = 100;
    const playerMoney = 5420;

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      world.step(1 / 60, delta, 3);

      player.position.copy(playerBody.position as any);
      player.quaternion.copy(playerBody.quaternion as any);

      const speed = 8;
      const force = new CANNON.Vec3();

      if (keys['w'] || keys['arrowup']) {
        force.z -= speed;
      }
      if (keys['s'] || keys['arrowdown']) {
        force.z += speed;
      }
      if (keys['a'] || keys['arrowleft']) {
        force.x -= speed;
      }
      if (keys['d'] || keys['arrowright']) {
        force.x += speed;
      }

      if (keys['q']) {
        cameraAngle -= 0.03;
      }
      if (keys['e']) {
        cameraAngle += 0.03;
      }

      if (force.length() > 0) {
        playerBody.applyForce(force, playerBody.position);
      }

      if (playerBody.position.y > 0.1) {
        isJumping = true;
      } else {
        isJumping = false;
      }

      const cameraX = playerBody.position.x + Math.sin(cameraAngle) * cameraDistance;
      const cameraZ = playerBody.position.z + Math.cos(cameraAngle) * cameraDistance;
      const cameraY = playerBody.position.y + 8;

      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.1);
      camera.lookAt(playerBody.position.x, playerBody.position.y + 1, playerBody.position.z);

      onGameStateChange({
        health: playerHealth,
        armor: 50,
        money: playerMoney,
        position: {
          x: Math.round(playerBody.position.x),
          y: Math.round(playerBody.position.y),
          z: Math.round(playerBody.position.z),
        },
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsInitialized(true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInitialized, onGameStateChange]);

  return <div ref={mountRef} className="absolute inset-0" />;
};

export default Game3D;
