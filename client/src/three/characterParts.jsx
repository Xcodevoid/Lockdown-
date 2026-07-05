// Low-poly 3D character built from primitive Three.js shapes - no external models/textures.
// Deliberately mirrors the visual language of the 2D icon set (icons.jsx): a shared
// "person" body for Prisoner/Veteran/Leader (with a stripe / crown marking the latter two),
// and a shared "capped" body for Guard/Sergeant/Warden (with a stripe / badge marking the
// latter two), so the 3D characters read as a continuation of the existing icons, not a
// disconnected new style.

function PersonBody({ color }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.55, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function CappedBody({ color }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.55, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function ChestStripe({ badgeColor }) {
  return (
    <mesh position={[0, 0.68, 0.3]} castShadow>
      <boxGeometry args={[0.28, 0.08, 0.04]} />
      <meshStandardMaterial color={badgeColor} />
    </mesh>
  );
}

function Crown({ badgeColor }) {
  return (
    <mesh position={[0, 1.42, 0]} castShadow>
      <coneGeometry args={[0.2, 0.24, 5]} />
      <meshStandardMaterial color={badgeColor} />
    </mesh>
  );
}

function CapBadge({ badgeColor }) {
  return (
    <mesh position={[0, 1.12, 0.28]} castShadow>
      <icosahedronGeometry args={[0.09, 0]} />
      <meshStandardMaterial color={badgeColor} />
    </mesh>
  );
}

const BADGE_GOLD = '#f2c94c';

export default function CharacterModel({ classKey, color }) {
  switch (classKey) {
    case 'prisoner':
      return <PersonBody color={color} />;
    case 'veteran':
      return (
        <>
          <PersonBody color={color} />
          <ChestStripe badgeColor="#10131a" />
        </>
      );
    case 'leader':
      return (
        <>
          <PersonBody color={color} />
          <Crown badgeColor={BADGE_GOLD} />
        </>
      );
    case 'guard':
      return <CappedBody color={color} />;
    case 'sergeant':
      return (
        <>
          <CappedBody color={color} />
          <ChestStripe badgeColor={BADGE_GOLD} />
        </>
      );
    case 'warden':
      return (
        <>
          <CappedBody color={color} />
          <CapBadge badgeColor={BADGE_GOLD} />
        </>
      );
    default:
      return <PersonBody color={color} />;
  }
}
