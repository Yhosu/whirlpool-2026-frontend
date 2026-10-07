import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';

interface WaterPhysicsFloorProps {
  wetness: number; // 0 = dry (roughness 0.8), 1 = wet (roughness 0.05)
  wetnessRef?: React.MutableRefObject<number>;
  splashActive: boolean; // active when door swings open
  dryProgress: number; // 0 = full puddle, 1 = evaporated
  dryProgressRef?: React.MutableRefObject<number>;
}

const DROPLET_COUNT = 96;
const MIST_PARTICLE_COUNT = 120;

export const WaterPhysicsFloor: React.FC<WaterPhysicsFloorProps> = ({
  wetness,
  wetnessRef,
  splashActive,
  dryProgress,
  dryProgressRef,
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const puddleMeshRef = useRef<THREE.Mesh>(null);
  const mistPointsRef = useRef<THREE.Points>(null);

  // Droplet physical simulation storage
  const droplets = useMemo(() => {
    return Array.from({ length: DROPLET_COUNT }, () => ({
      pos: new THREE.Vector3(0, -0.06, 0.88),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        0.3 + Math.random() * 0.9,
        1.0 + Math.random() * 2.2
      ),
      active: false,
      scale: 0.03 + Math.random() * 0.045,
    }));
  }, []);

  // Mist particle positions & velocities
  const mistData = useMemo(() => {
    const positions = new Float32Array(MIST_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(MIST_PARTICLE_COUNT);
    const alphas = new Float32Array(MIST_PARTICLE_COUNT);

    for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.1;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -1.16 + Math.random() * 0.1;
      positions[i * 3 + 2] = 1.3 + Math.sin(angle) * radius;
      velocities[i] = 0.25 + Math.random() * 0.45;
      alphas[i] = Math.random();
    }

    return { positions, velocities, alphas };
  }, []);

  // Trigger droplet burst when splashActive fires
  useEffect(() => {
    if (splashActive) {
      droplets.forEach((d) => {
        d.pos.set(
          (Math.random() - 0.5) * 0.6,
          -0.06 + (Math.random() - 0.5) * 0.4,
          0.85 + Math.random() * 0.2
        );
        d.vel.set(
          (Math.random() - 0.5) * 2.2,
          0.5 + Math.random() * 1.2,
          1.2 + Math.random() * 2.4
        );
        d.active = true;
      });
    }
  }, [splashActive, droplets]);

  // Dummy matrix for instanced mesh updates
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const currWet = wetnessRef ? wetnessRef.current : wetness;
    const currDry = dryProgressRef ? dryProgressRef.current : dryProgress;

    // 1. Droplet parabolic physics (gravity + floor bounce)
    if (instancedMeshRef.current) {
      droplets.forEach((d, i) => {
        if (!d.active) {
          tempMatrix.makeScale(0, 0, 0);
          instancedMeshRef.current!.setMatrixAt(i, tempMatrix);
          return;
        }

        // Apply gravity
        d.vel.y -= 9.8 * dt;
        d.pos.x += d.vel.x * dt;
        d.pos.y += d.vel.y * dt;
        d.pos.z += d.vel.z * dt;

        // Ground collision at y = -1.16
        if (d.pos.y <= -1.16) {
          d.pos.y = -1.16;
          d.vel.y = -d.vel.y * 0.25; // bounce damping
          d.vel.x *= 0.8;
          d.vel.z *= 0.8;
          d.scale *= 0.95; // flatten out into splash
          if (d.scale < 0.005) {
            d.active = false;
          }
        }

        tempScale.set(d.scale, d.scale * 0.8, d.scale);
        tempMatrix.makeScale(tempScale.x, tempScale.y, tempScale.z);
        tempMatrix.setPosition(d.pos.x, d.pos.y, d.pos.z);
        instancedMeshRef.current!.setMatrixAt(i, tempMatrix);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Organic puddle shrinkage during dryProgress
    if (puddleMeshRef.current) {
      const activeSize = Math.max(0.001, (1 - currDry) * currWet);
      puddleMeshRef.current.scale.set(activeSize, activeSize, 1);
      (puddleMeshRef.current.material as THREE.MeshStandardMaterial).opacity =
        Math.max(0, (1 - currDry) * 0.88 * currWet);
    }

    // 3. Mist particle rise & dissipation
    if (mistPointsRef.current && currDry > 0.05 && currDry < 0.98) {
      const posAttr = mistPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
        posArray[i * 3 + 1] += mistData.velocities[i] * dt;
        // Reset if reached ceiling
        if (posArray[i * 3 + 1] > 0.6) {
          posArray[i * 3 + 1] = -1.16;
        }
      }
      posAttr.needsUpdate = true;
      (mistPointsRef.current.material as THREE.PointsMaterial).opacity =
        Math.max(0, Math.sin(currDry * Math.PI) * 0.55);
    }
  });

  const currWet = wetnessRef ? wetnessRef.current : wetness;
  // Calculate dynamic roughness and wet albedo color
  const dynamicRoughness = THREE.MathUtils.lerp(0.8, 0.05, currWet);
  const dynamicColor = useMemo(() => {
    const dryColor = new THREE.Color('#DDE2E8');
    const wetColor = new THREE.Color('#383D44');
    return dryColor.lerp(wetColor, currWet);
  }, [currWet]);

  return (
    <group>
      {/* ================= 1. PHOTOREALISTIC REFLECTIVE STUDIO FLOOR ================= */}
      {/* Mandatory: MeshReflectorMaterial with dry/wet interpolation */}
      <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <MeshReflectorMaterial
          blur={[350, 100]}
          resolution={512}
          mirror={0.75}
          mixBlur={0.8}
          mixStrength={1.8}
          roughness={dynamicRoughness}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={dynamicColor}
          metalness={0.4}
        />
      </mesh>

      {/* ================= 2. ORGANIC WATER PUDDLE OVERLAY ================= */}
      {/* Expands on water impact, organic threshold shrink during dry dissipation */}
      <mesh
        ref={puddleMeshRef}
        position={[0, -1.172, 1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.95, 48]} />
        <meshStandardMaterial
          color="#38546A"
          roughness={0.02}
          metalness={0.1}
          transparent
          opacity={0.88 * currWet}
          depthWrite={false}
        />
      </mesh>

      {/* ================= 3. INSTANCED WATER SPLASH DROPLETS ================= */}
      {/* Physical instanced mesh with dynamic gravity, velocity & bounce */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, DROPLET_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshPhysicalMaterial
          color="#E8F4F8"
          transmission={0.92}
          roughness={0.05}
          ior={1.33}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      {/* ================= 4. EVAPORATING MIST / FOG POINTS ================= */}
      {/* Particle steam desprendiendo partículas con desvanecimiento de alfa */}
      <points ref={mistPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MIST_PARTICLE_COUNT}
            array={mistData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#E2EEF4"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
