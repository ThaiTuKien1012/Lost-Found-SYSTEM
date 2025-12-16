import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const meshRef = useRef();
  const particlesRef = useRef();

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current;
    const count = 200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }

    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const animate = () => {
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += 0.001;
          if (positions[i] > 10) positions[i] = -10;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="#2180A0" transparent opacity={0.6} />
    </points>
  );
}

function AnimatedSphere() {
  const meshRef = useRef();

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#2180A0" transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

const AnimatedBackground = ({ intensity = 0.3 }) => {
  return (
    <div className="animated-background" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: intensity }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FloatingParticles />
        <AnimatedSphere />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;

