import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles({ count = 2000 }) {
  const mesh = useRef();
  const particles = useRef(
    Array.from({ length: count }, () => ({
      time: Math.random() * 100,
      factor: 20 + Math.random() * 100,
      speed: 0.01 + Math.random() / 200,
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      z: Math.random() * 2000 - 1000,
    }))
  );

  const positions = useMemo(() => {
    return new Float32Array(
      particles.current.flatMap((p) => [p.x, p.y, p.z])
    );
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array;
    
    particles.current.forEach((particle, i) => {
      const { factor, speed, x, y, z } = particle;
      const t = (particle.time += speed);
      
      positions[i * 3] = x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
      positions[i * 3 + 1] = y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
      positions[i * 3 + 2] = z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;
    });
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#2180A0"
        size={1.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

const ThreeBackground = () => {
  return (
    <div className="three-background">
      <Canvas
        camera={{
          position: [0, 0, 1000],
          fov: 75,
        }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FloatingParticles count={2000} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;

