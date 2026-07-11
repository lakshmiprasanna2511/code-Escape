import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function Spinner({ type, solved }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (solved ? 0.9 : 0.5);
    ref.current.rotation.x += dt * 0.2;
  });
  const color = solved ? '#00ffb2' : type === 'vault' ? '#ff3d63' : '#3aa8ff';
  return (
    <group ref={ref}>
      {type === 'door' && (
        <mesh>
          <boxGeometry args={[1.1, 1.7, 0.25]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
        </mesh>
      )}
      {type === 'terminal' && (
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
        </mesh>
      )}
      {type === 'vault' && (
        <mesh>
          <torusGeometry args={[0.85, 0.28, 8, 24]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

export default function PuzzleObject3D({ type, solved }) {
  return (
    <div style={{ width: 78, height: 78, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} gl={{ alpha: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} />
        <Spinner type={type} solved={solved} />
      </Canvas>
    </div>
  );
}
