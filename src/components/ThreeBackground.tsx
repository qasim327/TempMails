import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  isDark?: boolean;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ isDark = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for software WebGL to balance performance
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x9370db : 0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa855f7, isDark ? 2.2 : 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, isDark ? 1.8 : 1.2);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    // Create Procedural 3D Envelope
    function createEnvelope(baseColor: number, accentColor: number) {
      const group = new THREE.Group();

      // Main Envelope Body
      const bodyGeo = new THREE.BoxGeometry(1.6, 1.05, 0.12);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Triangular Flap
      const flapShape = new THREE.Shape();
      flapShape.moveTo(-0.8, 0.525);
      flapShape.lineTo(0.8, 0.525);
      flapShape.lineTo(0, -0.08);
      flapShape.closePath();

      const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
      const flapGeo = new THREE.ExtrudeGeometry(flapShape, extrudeSettings);
      const flapMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.25,
        metalness: 0.35,
      });
      const flap = new THREE.Mesh(flapGeo, flapMat);
      flap.position.z = 0.06;
      group.add(flap);

      // Metallic Wax Seal / Stamp Button in center
      const stampGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24);
      const stampMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.2,
      });
      const stamp = new THREE.Mesh(stampGeo, stampMat);
      stamp.rotation.x = Math.PI / 2;
      stamp.position.set(0, -0.06, 0.11);
      group.add(stamp);

      // White paper sheet peeking out slightly
      const paperGeo = new THREE.BoxGeometry(1.4, 0.9, 0.02);
      const paperMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.6,
        metalness: 0.05,
      });
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.set(0, 0.15, -0.01);
      group.add(paper);

      return group;
    }

    // Envelope 1 (Left floating envelope)
    const envelope1 = createEnvelope(isDark ? 0x2e1065 : 0x7c3aed, 0xa855f7);
    envelope1.position.set(-3.2, 0.8, -0.5);
    envelope1.rotation.set(0.2, 0.3, -0.15);
    scene.add(envelope1);

    // Envelope 2 (Right floating envelope)
    const envelope2 = createEnvelope(isDark ? 0x1e1b4b : 0x4f46e5, 0x38bdf8);
    envelope2.position.set(3.4, -0.6, -1.2);
    envelope2.rotation.set(-0.15, -0.4, 0.1);
    envelope2.scale.set(0.85, 0.85, 0.85);
    scene.add(envelope2);

    // Subtle Particle Dust (Floating stars/cubes)
    const particleCount = 28;
    const particleGroup = new THREE.Group();
    const pGeo = new THREE.OctahedronGeometry(0.04, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });

    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      particles.push(p);
      particleGroup.add(p);
    }
    scene.add(particleGroup);

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.45;
      targetMouseY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Adjust positions for mobile viewports
      if (width < 768) {
        envelope1.position.set(-1.6, 1.8, -2.5);
        envelope1.scale.set(0.65, 0.65, 0.65);
        envelope2.position.set(1.6, -1.8, -2.8);
        envelope2.scale.set(0.55, 0.55, 0.55);
      } else {
        envelope1.position.set(-3.2, 0.8, -0.5);
        envelope1.scale.set(1, 1, 1);
        envelope2.position.set(3.4, -0.6, -1.2);
        envelope2.scale.set(0.85, 0.85, 0.85);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mouse Parallax Smooth Damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Envelope 1 Motion: Float up/down (duration ~4s) + rotate Y (360deg in 20s)
      const floatY1 = Math.sin(elapsed * 1.57) * 0.35; // 4s cycle
      envelope1.position.y = 0.8 + floatY1 + currentMouseY * 0.5;
      envelope1.position.x = (container.clientWidth < 768 ? -1.6 : -3.2) + currentMouseX * 0.8;
      envelope1.rotation.y = elapsed * 0.314; // ~20s full loop
      envelope1.rotation.x = 0.2 + Math.cos(elapsed * 0.8) * 0.08;

      // Envelope 2 Motion
      const floatY2 = Math.cos(elapsed * 1.4) * 0.3;
      envelope2.position.y = -0.6 + floatY2 - currentMouseY * 0.4;
      envelope2.position.x = (container.clientWidth < 768 ? 1.6 : 3.4) - currentMouseX * 0.7;
      envelope2.rotation.y = -elapsed * 0.28;
      envelope2.rotation.z = 0.1 + Math.sin(elapsed * 0.9) * 0.07;

      // Particle Gentle Drift
      particleGroup.rotation.y = elapsed * 0.04;
      particleGroup.rotation.x = currentMouseY * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 3 Ambient Gradient Blobs (Purple, Blue, Pink) */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-35 dark:opacity-25 transition-all duration-1000 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(124, 58, 237, 0) 70%)',
          animationDuration: '8s',
        }}
      />
      <div
        className="absolute bottom-1/3 -right-24 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30 dark:opacity-20 transition-all duration-1000 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(37, 99, 235, 0) 70%)',
          animationDuration: '10s',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute top-2/3 left-1/3 w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-25 dark:opacity-15 transition-all duration-1000 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(219, 39, 119, 0) 70%)',
          animationDuration: '12s',
          animationDelay: '4s',
        }}
      />

      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
