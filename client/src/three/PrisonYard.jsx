import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Avatar from './Avatar.jsx';
import Station from './Station.jsx';

// The `camera` shorthand prop on <Canvas> only sets position/fov - it does NOT aim the camera
// at anything, so without this the camera faces its default direction (away from our scene,
// which renders as a blank canvas). This runs once to point it at the yard.
function CameraAim({ target }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

// x-offsets for however many stations are currently eligible (2 or 3 - fatigue/barricade
// already narrows this before it reaches us, same array UnitPicker used to render buttons from).
const LAYOUT_BY_COUNT = {
  1: [0],
  2: [-1.6, 1.6],
  3: [-2.3, 0, 2.3],
};

export default function PrisonYard({ options, color, side, onCommit }) {
  const [committed, setCommitted] = useState(false);
  const targetRef = useRef(new THREE.Vector3(0, 0, 2.6));
  const walkingClassRef = useRef(null);

  const positions = useMemo(() => {
    const xs = LAYOUT_BY_COUNT[options.length] || LAYOUT_BY_COUNT[3];
    return options.map((opt, i) => [xs[i], 0, -1.4]);
  }, [options]);

  function handleSelect(cls, position) {
    if (committed) return;
    walkingClassRef.current = cls;
    targetRef.current.set(position[0], 0, position[2]);
  }

  function handleArrive() {
    if (committed || !walkingClassRef.current) return;
    setCommitted(true);
    onCommit(walkingClassRef.current);
  }

  return (
    <Canvas shadows camera={{ position: [0, 5.5, 6.5], fov: 42 }}>
      <CameraAim target={[0, 0, -0.3]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 3]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#1a1e27" />
      </mesh>
      <gridHelper args={[14, 14, '#333a4a', '#262c38']} position={[0, 0.001, 0]} />

      {options.map((opt, i) => (
        <Station
          key={opt.cls}
          position={positions[i]}
          classKey={opt.cls}
          color={color}
          label={opt.label}
          onSelect={() => handleSelect(opt.cls, positions[i])}
        />
      ))}

      <Avatar classKey={side === 'guards' ? 'guard' : 'prisoner'} color={color} targetRef={targetRef} onArrive={handleArrive} />
    </Canvas>
  );
}
