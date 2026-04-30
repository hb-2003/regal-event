"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Custom GLSL Shader for Liquid Image Distortion
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uHover;

  varying vec2 vUv;

  void main() {
    // Normalize mouse coords
    vec2 mouse = uMouse;

    // Calculate distance from pixel to mouse
    float dist = distance(vUv, mouse);

    // Create a smooth ripple effect based on distance and time
    float ripple = sin(dist * 20.0 - uTime * 4.0) * 0.02 * uHover;

    // Soften the ripple further away from mouse
    float falloff = smoothstep(0.4, 0.0, dist);
    vec2 distortedUv = vUv + (vUv - mouse) * ripple * falloff;

    // Sample texture with distorted UVs
    vec4 color = texture2D(uTexture, distortedUv);

    // Add a slight darkening overlay to ensure text readability (replicating the hero-overlay)
    vec4 overlay = mix(vec4(0.004, 0.12, 0.14, 1.0), vec4(0.004, 0.35, 0.38, 1.0), vUv.x);
    color = mix(color, overlay, 0.65);

    gl_FragColor = color;
  }
`;

function LiquidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80");

  const { viewport, size } = useThree();

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uHover: { value: 0 },
    }),
    [texture, size]
  );

  // Target values for smooth interpolation
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const targetHover = useRef(0);

  // Update loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

      // Smoothly interpolate mouse position and hover state
      uniforms.uMouse.value.lerp(targetMouse.current, 0.05);
      uniforms.uHover.value += (targetHover.current - uniforms.uHover.value) * 0.05;
    }
  });

  // Event handlers
  const handlePointerMove = (e: any) => {
    targetMouse.current.set(e.uv.x, e.uv.y);
  };

  const handlePointerEnter = () => {
    targetHover.current = 1.0;
  };

  const handlePointerLeave = () => {
    targetHover.current = 0.0;
    targetMouse.current.set(0.5, 0.5);
  };

  return (
    <mesh
      ref={meshRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function HeroWebGL() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 2]} // Optimize pixel ratio
      >
        <LiquidPlane />
      </Canvas>
    </div>
  );
}
