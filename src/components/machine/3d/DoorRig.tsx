import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

interface DoorRigProps {
  doorAngle?: number; // In radians: 0 = closed, -1.95 = fully open
  doorAngleRef?: React.MutableRefObject<number>;
}

export const DoorRig: React.FC<DoorRigProps> = ({ doorAngle = 0, doorAngleRef }) => {
  const hingeGroupRef = useRef<THREE.Group>(null);

  // Smoothly update hinge angle in frame loop at native 60fps without React re-renders
  useFrame(() => {
    if (hingeGroupRef.current) {
      const angle = doorAngleRef ? doorAngleRef.current : doorAngle;
      hingeGroupRef.current.rotation.y = angle;
    }
  });

  return (
    /* Left Hinge Pivot Anchor: positioned on the machine cabinet front edge */
    <group position={[-0.68, -0.06, 0.93]}>
      {/* Mechanical Hinge Pin on Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.24, 16]} />
        <meshStandardMaterial color="#2B2F36" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Rotating Rig Pivot */}
      <group ref={hingeGroupRef}>
        {/* Door assembly shifted back so center aligns with drum opening at [0, -0.06, 0.93] when doorAngle = 0 */}
        <group position={[0.68, 0, 0.015]}>
          {/* ================= 1. DARK GRAPHITE & CHROME PORTHOLE OUTER FRAME ================= */}
          {/* Main Exterior Dark Metallic Bezel Ring */}
          <mesh>
            <torusGeometry args={[0.67, 0.045, 24, 64]} />
            <meshPhysicalMaterial
              color="#22252A"
              roughness={0.18}
              metalness={0.92}
              clearcoat={0.6}
              clearcoatRoughness={0.1}
              reflectivity={0.9}
            />
          </mesh>

          {/* Polished Chrome Inner Accent Ring */}
          <mesh position={[0, 0, 0.005]}>
            <torusGeometry args={[0.63, 0.016, 16, 64]} />
            <meshStandardMaterial color="#DDE2E6" roughness={0.08} metalness={0.98} />
          </mesh>

          {/* Secondary Concentric Gasket Inset Ring */}
          <mesh position={[0, 0, -0.012]}>
            <torusGeometry args={[0.6, 0.022, 16, 64]} />
            <meshStandardMaterial color="#16181B" roughness={0.6} metalness={0.5} />
          </mesh>

          {/* Sleek Ergonomic Integrated Handle at 3 o'clock position (Right edge) */}
          <group position={[0.64, 0, 0.025]}>
            {/* Vertical curved outer grip */}
            <mesh>
              <capsuleGeometry args={[0.022, 0.16, 12, 16]} />
              <meshStandardMaterial color="#C8CED6" roughness={0.12} metalness={0.95} />
            </mesh>
            {/* Dark finger grip inset behind the handle */}
            <mesh position={[-0.018, 0, -0.012]}>
              <boxGeometry args={[0.025, 0.14, 0.02]} />
              <meshStandardMaterial color="#141619" roughness={0.8} />
            </mesh>
          </group>

          {/* ================= 2. PHOTOREALISTIC CONVEX TRANSMISSION GLASS ================= */}
          {/* Mandatory: MeshTransmissionMaterial from @react-three/drei (calibrated per requirements) */}
          <mesh position={[0, 0, -0.015]}>
            <sphereGeometry args={[0.605, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
            <MeshTransmissionMaterial
              transmission={0.95}
              roughness={0.05}
              thickness={0.2}
              ior={1.52}
              chromaticAberration={0.03}
              distortion={0.02}
              distortionScale={0.1}
              temporalDistortion={0}
              color="#FFFFFF"
              attenuationColor="#E0F2FE"
              attenuationDistance={1.8}
            />
          </mesh>

          {/* Subtle outer convex glass sheen */}
          <mesh position={[0, 0, 0.008]}>
            <sphereGeometry args={[0.605, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.18]} />
            <meshPhysicalMaterial
              transparent
              opacity={0.32}
              roughness={0.04}
              metalness={0.1}
              color="#EBF4F8"
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
