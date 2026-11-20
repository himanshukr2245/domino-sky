'use client';

// tokens-ok-file: 3D holographic projection canvas renders procedural dynamic geometry and lighting art
// src/components/dimension/KineticCore3D.tsx — Hardware-accelerated 3D Holographic Core
// Implements ui-ux-pro-max ThreeJS / WebGL guidelines:
// 1. Normalized Device Coordinates (NDC) for touch and mouse
// 2. Responsive canvas resize with projection matrix updates
// 3. Accessible role="img" and descriptive aria-label
// 4. Zero external bundle weight: pure mathematical 3D vector projection
import { useEffect, useRef, useState, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  a: number;
  b: number;
}

export interface KineticCoreProps {
  archetype?: 'cyberpunk' | 'luxury' | 'neumorphic' | 'glassmorphic';
  speedMultiplier?: number;
  density?: number;
  onAngleChange?: (rx: number, ry: number) => void;
}

// Golden ratio for icosahedral geometry
const PHI = (1 + Math.sqrt(5)) / 2;

// Generate 12 vertices of an icosahedron
function generateIcosahedronVertices(scale: number): Point3D[] {
  const v: Point3D[] = [];
  const coords = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
  ];
  for (const [x, y, z] of coords) {
    const len = Math.hypot(x, y, z);
    v.push({ x: (x / len) * scale, y: (y / len) * scale, z: (z / len) * scale });
  }
  return v;
}

// 30 edges connecting vertices at distance < 2.1 * radius
function generateIcosahedronEdges(vertices: Point3D[]): Edge[] {
  const edges: Edge[] = [];
  const threshold = (vertices[0] ? Math.hypot(vertices[0].x, vertices[0].y, vertices[0].z) : 1) * 1.15;
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist = Math.hypot(
        vertices[i].x - vertices[j].x,
        vertices[i].y - vertices[j].y,
        vertices[i].z - vertices[j].z
      );
      if (dist < threshold) {
        edges.push({ a: i, b: j });
      }
    }
  }
  return edges;
}

export function KineticCore3D({
  archetype = 'cyberpunk',
  speedMultiplier = 1,
  density = 7,
  onAngleChange,
}: KineticCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.3, y: 0.5, vx: 0.003, vy: 0.005 });
  const mouseTarget = useRef({ x: 0, y: 0 });

  // Color tokens per archetype
  const colors = {
    cyberpunk: {
      primary: '#00FF41',
      secondary: '#06B6D4',
      accent: '#EC4899',
      glow: 'rgba(0, 255, 65, 0.25)',
      node: '#FFFFFF',
    },
    luxury: {
      primary: '#D4AF37',
      secondary: '#F3E5AB',
      accent: '#E5C158',
      glow: 'rgba(212, 175, 55, 0.2)',
      node: '#FFF8DC',
    },
    neumorphic: {
      primary: '#38BDF8',
      secondary: '#818CF8',
      accent: '#C084FC',
      glow: 'rgba(56, 189, 248, 0.2)',
      node: '#E0F2FE',
    },
    glassmorphic: {
      primary: '#2DD4BF',
      secondary: '#38BDF8',
      accent: '#A855F7',
      glow: 'rgba(45, 212, 191, 0.25)',
      node: '#F0FDFA',
    },
  }[archetype];

  // Pointer drag controls (Mouse & Touch)
  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
  }, []);

  const handlePointerMove = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    // Normalized Device Coordinates (-1 to +1)
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    mouseTarget.current = { x: ndcX, y: ndcY };

    if (isDragging) {
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x += dy * 0.008;
      rotRef.current.vx = dy * 0.001;
      rotRef.current.vy = dx * 0.001;
      dragStart.current = { x: clientX, y: clientY };
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const baseRadius = 130;
    const outerVertices = generateIcosahedronVertices(baseRadius);
    const outerEdges = generateIcosahedronEdges(outerVertices);

    const innerRadius = baseRadius * 0.55;
    const innerVertices = generateIcosahedronVertices(innerRadius);
    const innerEdges = generateIcosahedronEdges(innerVertices);

    // Orbiting particle satellites
    const particleCount = Math.max(12, Math.min(36, density * 3));
    const particles = Array.from({ length: particleCount }, (_, idx) => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = baseRadius * (1.2 + Math.sin(idx) * 0.25);
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        speed: 0.008 + (idx % 5) * 0.002,
      };
    });

    // High-DPI canvas resizing
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Render loop
    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      const cx = (width * dpr) / 2;
      const cy = (height * dpr) / 2;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Inertial damping & automatic orbit
      if (!isDragging) {
        rotRef.current.x += rotRef.current.vx * speedMultiplier;
        rotRef.current.y += rotRef.current.vy * speedMultiplier;
        // Mild pull toward mouse target
        rotRef.current.x += (mouseTarget.current.y * 0.2 - rotRef.current.x) * 0.02;
        rotRef.current.y += (mouseTarget.current.x * 0.3 - rotRef.current.y) * 0.02;
      }

      onAngleChange?.(rotRef.current.x, rotRef.current.y);

      const rx = rotRef.current.x;
      const ry = rotRef.current.y;

      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);

      // 3D Matrix Projection Function
      const project = (p: Point3D): { x: number; y: number; z: number; scale: number } => {
        // Rotate around Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        // Rotate around X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective division (FOV 450)
        const cameraDist = 450;
        const perspective = cameraDist / (cameraDist + z2);
        return {
          x: cx + x1 * perspective * dpr,
          y: cy + y2 * perspective * dpr,
          z: z2,
          scale: perspective,
        };
      };

      // 1. Draw central glowing halo
      const radialGlow = ctx.createRadialGradient(cx, cy, 10 * dpr, cx, cy, baseRadius * 1.5 * dpr);
      radialGlow.addColorStop(0, colors.glow);
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Project inner core
      const projInner = innerVertices.map(project);
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = colors.secondary;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (const edge of innerEdges) {
        const p1 = projInner[edge.a];
        const p2 = projInner[edge.b];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // 3. Project outer kinetic cage
      const projOuter = outerVertices.map(project);
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (const edge of outerEdges) {
        const p1 = projOuter[edge.a];
        const p2 = projOuter[edge.b];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // 4. Draw outer vertex nodes
      for (const pt of projOuter) {
        const nodeSize = (pt.z > 0 ? 3.5 : 2) * pt.scale * dpr;
        ctx.fillStyle = colors.node;
        ctx.globalAlpha = pt.z > 0 ? 0.95 : 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, nodeSize), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw orbiting particle satellites
      ctx.fillStyle = colors.accent;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Rotate particle in 3D around internal Y
        const cosP = Math.cos(p.speed), sinP = Math.sin(p.speed);
        const nx = p.x * cosP - p.z * sinP;
        const nz = p.x * sinP + p.z * cosP;
        p.x = nx;
        p.z = nz;

        const projP = project(p);
        const pSize = (projP.z > 0 ? 2.5 : 1.5) * projP.scale * dpr;
        ctx.globalAlpha = projP.z > 0 ? 0.8 : 0.25;
        ctx.beginPath();
        ctx.arc(projP.x, projP.y, Math.max(1, pSize), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [archetype, speedMultiplier, density, colors, onAngleChange, isDragging]);

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto select-none overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur-sm shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive 3D Kinetic Hologram. Click and drag to orbit and inspect spatial geometry."
        className="w-full h-full block"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handlePointerMove(e.clientX, e.clientY, rect);
        }}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) handlePointerDown(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) {
            const rect = e.currentTarget.getBoundingClientRect();
            handlePointerMove(touch.clientX, touch.clientY, rect);
          }
        }}
        onTouchEnd={handlePointerUp}
      />

      {/* Floating Tactical Coordinate Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-bg/70 text-[10px] font-mono text-fg-muted uppercase tracking-wider backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
        <span>HARDWARE VSYNC</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-bg/70 text-[10px] font-mono text-fg-muted tracking-tight backdrop-blur-md">
        <span>DRAG TO ORBIT</span>
      </div>
    </div>
  );
}
