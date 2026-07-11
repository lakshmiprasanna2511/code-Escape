import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function GridFloor() {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.material.uniforms.uTime.value += dt;
  });
  const size = 60;
  const divisions = 60;
  const shader = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uColorA: { value: new THREE.Color('#00ffb2') }, uColorB: { value: new THREE.Color('#3aa8ff') } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      float grid(vec2 uv, float size) {
        vec2 g = abs(fract(uv * size - 0.5) - 0.5) / fwidth(uv * size);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        vec2 uv = vUv;
        float d = distance(uv, vec2(0.5, 0.15));
        float g = grid(uv, 40.0);
        vec3 col = mix(uColorA, uColorB, uv.y);
        float fade = smoothstep(0.75, 0.0, d);
        float pulse = 0.5 + 0.5 * sin(uTime * 0.6 - d * 14.0);
        gl_FragColor = vec4(col * g * fade * (0.5 + pulse * 0.5), g * fade * 0.75);
      }
    `,
    transparent: true,
  }), []);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -3.2, 0]}>
      <planeGeometry args={[size, size, 1, 1]} />
      <shaderMaterial args={[shader]} transparent depthWrite={false} />
    </mesh>
  );
}

function Wireframe({ position, geo = 'ico', color = '#00ffb2', scale = 1, speed = 0.2 }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * speed;
    ref.current.rotation.y += dt * speed * 0.7;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={1.1}>
      <mesh ref={ref} position={position} scale={scale}>
        {geo === 'ico' && <icosahedronGeometry args={[1, 0]} />}
        {geo === 'octa' && <octahedronGeometry args={[1, 0]} />}
        {geo === 'torus' && <torusKnotGeometry args={[0.7, 0.22, 100, 16]} />}
        {geo === 'box' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
    </Float>
  );
}

function Particles({ count = 220 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += dt * 0.35;
      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = -12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00ffb2" size={0.045} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CenterCore({ color = '#3aa8ff' }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.15;
    ref.current.rotation.x += dt * 0.06;
  });
  return (
    <group ref={ref} position={[0, 0.4, -6]}>
      <mesh>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.16} />
      </mesh>
      <mesh scale={0.6}>
        <icosahedronGeometry args={[2.6, 0]} />
        <meshBasicMaterial color="#00ffb2" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function Scene3D({ variant = 'ambient' }) {
  return (
    <div className="canvas-bg">
      <Canvas camera={{ position: [0, 1.4, 9], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#05070b']} />
        <fog attach="fog" args={['#05070b', 8, 28]} />
        <ambientLight intensity={0.4} />
        <GridFloor />
        <Particles count={variant === 'game' ? 90 : 220} />
        {variant !== 'game' && <CenterCore />}
        <Wireframe position={[-4.5, 1.6, -3]} geo="ico" color="#00ffb2" scale={0.9} speed={0.25} />
        <Wireframe position={[4.8, -0.8, -4]} geo="octa" color="#3aa8ff" scale={1.1} speed={0.18} />
        <Wireframe position={[3.4, 2.6, -5]} geo="torus" color="#ff3d63" scale={0.7} speed={0.3} />
        <Wireframe position={[-3.8, -1.6, -2]} geo="box" color="#3aa8ff" scale={0.5} speed={0.35} />
      </Canvas>
    </div>
  );
}
