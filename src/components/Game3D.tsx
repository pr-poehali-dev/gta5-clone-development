import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface Game3DProps {
  onGameStateChange: (state: any) => void;
}

interface Car {
  mesh: THREE.Group;
  body: CANNON.Body;
  position: CANNON.Vec3;
}

interface NPC {
  mesh: THREE.Group;
  body: CANNON.Body;
  walkAngle: number;
  targetAngle: number;
  idleTime: number;
}

const Game3D = ({ onGameStateChange }: Game3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const initRef = useRef(false);

  const updateGameState = useCallback((state: any) => {
    onGameStateChange(state);
  }, [onGameStateChange]);

  useEffect(() => {
    if (!mountRef.current || initRef.current) return;
    initRef.current = true;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1f2c);
    scene.fog = new THREE.Fog(0x1a1f2c, 50, 200);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
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
    const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
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
    scene.add(road1);

    const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = Math.PI / 2;
    road2.position.y = 0.01;
    scene.add(road2);

    const buildingPositions = [
      { x: -30, z: -30, w: 15, h: 25, d: 15, color: 0x2a4858 },
      { x: -30, z: 15, w: 15, h: 20, d: 15, color: 0x3a3858 },
      { x: 15, z: -30, w: 15, h: 30, d: 15, color: 0x4a2838 },
      { x: 15, z: 15, w: 15, h: 18, d: 15, color: 0x2a5848 },
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
    });

    const createCharacter = (color: number) => {
      const character = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(0.6, 1, 0.4);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 1.2;
      body.castShadow = true;
      character.add(body);

      const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 1.95;
      head.castShadow = true;
      character.add(head);

      const legGeometry = new THREE.BoxGeometry(0.2, 0.7, 0.2);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.15, 0.5, 0);
      leftLeg.castShadow = true;
      character.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.15, 0.5, 0);
      rightLeg.castShadow = true;
      character.add(rightLeg);

      const armGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
      const armMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-0.45, 1.2, 0);
      leftArm.castShadow = true;
      character.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(0.45, 1.2, 0);
      rightArm.castShadow = true;
      character.add(rightArm);

      return character;
    };

    const createCar = (x: number, z: number, color: number): Car => {
      const carGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.7,
      });
      const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
      carBody.position.y = 0.75;
      carBody.castShadow = true;
      carGroup.add(carBody);

      const cabinGeometry = new THREE.BoxGeometry(2.5, 1, 1.8);
      const cabinMaterial = new THREE.MeshStandardMaterial({
        color: color * 0.8,
        roughness: 0.4,
        metalness: 0.6,
      });
      const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
      cabin.position.set(-0.5, 1.75, 0);
      cabin.castShadow = true;
      carGroup.add(cabin);

      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
      });

      const wheelPositions = [
        { x: 1.2, y: 0.4, z: 1 },
        { x: 1.2, y: 0.4, z: -1 },
        { x: -1.2, y: 0.4, z: 1 },
        { x: -1.2, y: 0.4, z: -1 },
      ];

      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.castShadow = true;
        carGroup.add(wheel);
      });

      carGroup.position.set(x, 1, z);
      scene.add(carGroup);

      const carShape = new CANNON.Box(new CANNON.Vec3(2, 0.75, 1));
      const carPhysicsBody = new CANNON.Body({
        mass: 500,
        shape: carShape,
        linearDamping: 0.5,
        angularDamping: 0.5,
      });
      carPhysicsBody.position.set(x, 1, z);
      world.addBody(carPhysicsBody);

      return {
        mesh: carGroup,
        body: carPhysicsBody,
        position: new CANNON.Vec3(x, 1, z),
      };
    };

    const cars: Car[] = [
      createCar(-10, -10, 0xff4444),
      createCar(10, 10, 0x4444ff),
      createCar(-15, 15, 0x44ff44),
      createCar(20, -15, 0xffff44),
    ];

    const player = createCharacter(0x0ea5e9);
    player.position.set(0, 0.1, 0);
    scene.add(player);

    const playerShape = new CANNON.Cylinder(0.3, 0.3, 1.8, 8);
    const playerBody = new CANNON.Body({
      mass: 70,
      shape: playerShape,
      linearDamping: 0.8,
      angularDamping: 0.99,
      fixedRotation: true,
    });
    playerBody.position.set(0, 1, 0);
    world.addBody(playerBody);

    const npcs: NPC[] = [];
    const npcPositions = [
      { x: -20, z: -5, color: 0xff6b6b },
      { x: 15, z: -8, color: 0x6bff6b },
      { x: -8, z: 20, color: 0x6b6bff },
      { x: 25, z: 25, color: 0xffff6b },
      { x: -25, z: 10, color: 0xff6bff },
    ];

    npcPositions.forEach(({ x, z, color }) => {
      const npc = createCharacter(color);
      npc.position.set(x, 0.1, z);
      scene.add(npc);

      const npcBody = new CANNON.Body({
        mass: 70,
        shape: new CANNON.Cylinder(0.3, 0.3, 1.8, 8),
        linearDamping: 0.8,
        fixedRotation: true,
      });
      npcBody.position.set(x, 1, z);
      world.addBody(npcBody);

      npcs.push({ 
        mesh: npc, 
        body: npcBody, 
        walkAngle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        idleTime: 0
      });
    });

    const keys: { [key: string]: boolean } = {};
    let isJumping = false;
    let isInCar = false;
    let currentCar: Car | null = null;
    let cameraAngle = 0;
    let cameraDistance = 15;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      
      if (e.code === 'Space' && !isJumping && !isInCar) {
        playerBody.velocity.y = 10;
        isJumping = true;
      }

      if (e.key.toLowerCase() === 'f') {
        if (!isInCar) {
          const nearestCar = cars.find(car => {
            const distance = Math.sqrt(
              Math.pow(car.body.position.x - playerBody.position.x, 2) +
              Math.pow(car.body.position.z - playerBody.position.z, 2)
            );
            return distance < 5;
          });

          if (nearestCar) {
            isInCar = true;
            currentCar = nearestCar;
            player.visible = false;
            playerBody.position.set(0, -1000, 0);
          }
        } else {
          isInCar = false;
          if (currentCar) {
            playerBody.position.set(
              currentCar.body.position.x + 3,
              currentCar.body.position.y + 2,
              currentCar.body.position.z
            );
            playerBody.velocity.set(0, 0, 0);
            player.visible = true;
            currentCar = null;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraDistance += e.deltaY * 0.01;
      cameraDistance = Math.max(5, Math.min(30, cameraDistance));
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let lastUpdate = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      world.step(1 / 60, delta, 3);

      cars.forEach(car => {
        car.mesh.position.copy(car.body.position as any);
        car.mesh.quaternion.copy(car.body.quaternion as any);
      });

      if (isInCar && currentCar) {
        const carSpeed = 15;
        const force = new CANNON.Vec3();

        if (keys['w'] || keys['arrowup']) {
          force.z -= carSpeed;
        }
        if (keys['s'] || keys['arrowdown']) {
          force.z += carSpeed;
        }
        if (keys['a'] || keys['arrowleft']) {
          force.x -= carSpeed;
        }
        if (keys['d'] || keys['arrowright']) {
          force.x += carSpeed;
        }

        if (force.length() > 0) {
          currentCar.body.applyForce(force, currentCar.body.position);
        }

        camera.position.lerp(
          new THREE.Vector3(
            currentCar.body.position.x + Math.sin(cameraAngle) * cameraDistance,
            currentCar.body.position.y + 10,
            currentCar.body.position.z + Math.cos(cameraAngle) * cameraDistance
          ),
          0.1
        );
        camera.lookAt(currentCar.body.position.x, currentCar.body.position.y, currentCar.body.position.z);
      } else {
        player.position.set(
          playerBody.position.x,
          playerBody.position.y - 0.9,
          playerBody.position.z
        );

        const speed = 150;
        const velocity = new CANNON.Vec3();

        if (keys['w'] || keys['arrowup']) {
          velocity.z -= speed;
        }
        if (keys['s'] || keys['arrowdown']) {
          velocity.z += speed;
        }
        if (keys['a'] || keys['arrowleft']) {
          velocity.x -= speed;
        }
        if (keys['d'] || keys['arrowright']) {
          velocity.x += speed;
        }

        if (keys['q']) {
          cameraAngle -= 0.03;
        }
        if (keys['e']) {
          cameraAngle += 0.03;
        }

        if (velocity.length() > 0) {
          playerBody.velocity.x = velocity.x * delta;
          playerBody.velocity.z = velocity.z * delta;
          
          const moveAngle = Math.atan2(velocity.x, velocity.z);
          player.rotation.y = moveAngle;
        } else {
          playerBody.velocity.x *= 0.8;
          playerBody.velocity.z *= 0.8;
        }

        if (Math.abs(playerBody.position.y - 1) < 0.2) {
          isJumping = false;
        } else {
          isJumping = true;
        }

        const cameraX = playerBody.position.x + Math.sin(cameraAngle) * cameraDistance;
        const cameraZ = playerBody.position.z + Math.cos(cameraAngle) * cameraDistance;
        const cameraY = playerBody.position.y + 8;

        camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.1);
        camera.lookAt(playerBody.position.x, playerBody.position.y + 1, playerBody.position.z);
      }

      npcs.forEach(npc => {
        npc.mesh.position.set(
          npc.body.position.x,
          npc.body.position.y - 0.9,
          npc.body.position.z
        );

        npc.idleTime--;
        if (npc.idleTime <= 0) {
          npc.targetAngle = Math.random() * Math.PI * 2;
          npc.idleTime = Math.random() * 120 + 60;
        }

        const angleDiff = npc.targetAngle - npc.walkAngle;
        npc.walkAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.05);

        const npcSpeed = 30;
        npc.body.velocity.x = Math.sin(npc.walkAngle) * npcSpeed * delta;
        npc.body.velocity.z = Math.cos(npc.walkAngle) * npcSpeed * delta;
        npc.mesh.rotation.y = npc.walkAngle;

        if (Math.abs(npc.body.position.x) > 40 || Math.abs(npc.body.position.z) > 40) {
          npc.targetAngle += Math.PI;
          npc.walkAngle += Math.PI;
        }
      });

      const now = Date.now();
      if (now - lastUpdate > 100) {
        lastUpdate = now;
        const activeBody = isInCar && currentCar ? currentCar.body : playerBody;
        updateGameState({
          health: 100,
          armor: 50,
          money: 5420,
          inCar: isInCar,
          position: {
            x: Math.round(activeBody.position.x),
            y: Math.round(activeBody.position.y),
            z: Math.round(activeBody.position.z),
          },
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      const currentMount = mountRef.current;
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      scene.clear();
      
      while (world.bodies.length > 0) {
        world.removeBody(world.bodies[0]);
      }

      initRef.current = false;
    };
  }, [updateGameState]);

  return <div ref={mountRef} className="absolute inset-0" />;
};

export default Game3D;
