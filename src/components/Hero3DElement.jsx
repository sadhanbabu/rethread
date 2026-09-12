import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DElement() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. 3D Eco Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Outer Wireframe Sphere (Earth representation)
    const sphereGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A7C59,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(sphereMesh);

    // Inner Core Sphere
    const innerGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xEBF2ED,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.7,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    globeGroup.add(innerMesh);

    // Orbital Nodes (NGO / Donor connection points)
    const nodeCount = 12;
    const nodesGroup = new THREE.Group();
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x2F533A });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      node.position.setFromSphericalCoords(1.62, phi, theta);
      nodesGroup.add(node);
    }
    globeGroup.add(nodesGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x4A7C59, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      globeGroup.rotation.y += 0.005;
      globeGroup.rotation.x += 0.002;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center relative pointer-events-none"
    />
  );
}
