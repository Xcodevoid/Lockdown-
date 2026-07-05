import { useState } from 'react';
import { Html } from '@react-three/drei';
import CharacterModel from './characterParts.jsx';

export default function Station({ position, classKey, color, label, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        position={[0, 0.04, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        receiveShadow
      >
        <cylinderGeometry args={[0.78, 0.88, 0.08, 28]} />
        <meshStandardMaterial color={hovered ? color : '#2a2f3a'} emissive={hovered ? color : '#000000'} emissiveIntensity={hovered ? 0.35 : 0} />
      </mesh>

      <group position={[0, 0.35, 0]} scale={0.75}>
        <CharacterModel classKey={classKey} color={color} />
      </group>

      <Html position={[0, 1.7, 0]} center distanceFactor={7} occlude={false}>
        <div className="yard-station-label">{label}</div>
      </Html>
    </group>
  );
}
