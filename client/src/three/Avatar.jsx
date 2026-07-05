import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CharacterModel from './characterParts.jsx';

// Controllable character: lerps toward whatever position is currently in targetRef.current
// every frame, and calls onArrive() once (per new target) when it gets close enough. Reading
// a ref inside useFrame (rather than a prop) avoids stale closures without re-rendering React
// on every animation frame - the standard pattern for imperative animation in R3F.
export default function Avatar({ classKey, color, targetRef, onArrive }) {
  const groupRef = useRef();
  const posRef = useRef(new THREE.Vector3(0, 0, 2.6));
  const hasArrivedForCurrentTarget = useRef(true);
  const lastTarget = useRef(new THREE.Vector3(0, 0, 2.6));

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const target = targetRef.current;
    if (!lastTarget.current.equals(target)) {
      lastTarget.current.copy(target);
      hasArrivedForCurrentTarget.current = false;
    }

    posRef.current.lerp(target, Math.min(1, delta * 4.5));
    g.position.copy(posRef.current);

    const dist = posRef.current.distanceTo(target);
    if (dist > 0.15) {
      const angle = Math.atan2(target.x - posRef.current.x, target.z - posRef.current.z);
      g.rotation.y = angle;
    }
    if (dist < 0.06 && !hasArrivedForCurrentTarget.current) {
      hasArrivedForCurrentTarget.current = true;
      onArrive?.();
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 2.6]}>
      <CharacterModel classKey={classKey} color={color} />
    </group>
  );
}
