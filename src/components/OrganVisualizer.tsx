import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Text, Html } from '@react-three/drei';
import { OrganBurden, OrganId, organInfo } from '@/lib/burdenEngine';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface OrganVisualizerProps {
  burdens: OrganBurden[];
}

// Realistic organ colors and positions for 3D model
const organConfigs: Record<OrganId, { 
  position: [number, number, number]; 
  scale: [number, number, number];
  color: string;
  geometry: 'sphere' | 'kidney' | 'custom';
}> = {
  brain: { position: [0, 2.4, 0], scale: [0.45, 0.35, 0.4], color: '#E8B4B8', geometry: 'sphere' },
  lungs: { position: [0, 1.0, 0.1], scale: [0.65, 0.55, 0.35], color: '#FFB5B5', geometry: 'sphere' },
  heart: { position: [0.1, 0.95, 0.25], scale: [0.18, 0.22, 0.18], color: '#8B0000', geometry: 'sphere' },
  liver: { position: [-0.25, 0.15, 0.2], scale: [0.4, 0.25, 0.2], color: '#8B4513', geometry: 'sphere' },
  stomach: { position: [0.15, 0.2, 0.15], scale: [0.22, 0.28, 0.18], color: '#DEB887', geometry: 'sphere' },
  pancreas: { position: [0, -0.1, 0.1], scale: [0.35, 0.08, 0.08], color: '#F4A460', geometry: 'sphere' },
  kidney: { position: [0, -0.2, -0.1], scale: [0.12, 0.18, 0.1], color: '#CD5C5C', geometry: 'kidney' },
  intestines: { position: [0, -0.6, 0.1], scale: [0.4, 0.35, 0.25], color: '#DDA0DD', geometry: 'sphere' },
};

const burdenGlowColors: Record<string, string> = {
  none: '#4a5568',
  low: '#68D391',
  medium: '#F6E05E',
  high: '#F6AD55',
  critical: '#FC8181',
};

const burdenEmissiveIntensity: Record<string, number> = {
  none: 0,
  low: 0.3,
  medium: 0.6,
  high: 1.0,
  critical: 1.5,
};

interface OrganMeshProps {
  organId: OrganId;
  config: typeof organConfigs[OrganId];
  burden?: OrganBurden;
  isSelected: boolean;
  onClick: () => void;
}

function OrganMesh({ organId, config, burden, isSelected, onClick }: OrganMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const level = burden?.level || 'none';
  const glowColor = burdenGlowColors[level];
  const emissiveIntensity = burdenEmissiveIntensity[level];

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.setScalar(1 + breathe);
      
      // Pulse effect for selected organs
      if (isSelected) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(1.1 + pulse);
      }
    }
  });

  // Create kidney-like shape
  const getGeometry = () => {
    if (config.geometry === 'kidney') {
      return (
        <>
          <mesh position={[-0.3, 0, 0]} ref={organId === 'kidney' ? meshRef : undefined}>
            <capsuleGeometry args={[0.08, 0.12, 8, 16]} />
            <meshPhysicalMaterial
              color={config.color}
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity}
              roughness={0.4}
              metalness={0.1}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
              transmission={0.1}
            />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.12, 8, 16]} />
            <meshPhysicalMaterial
              color={config.color}
              emissive={glowColor}
              emissiveIntensity={emissiveIntensity}
              roughness={0.4}
              metalness={0.1}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
              transmission={0.1}
            />
          </mesh>
        </>
      );
    }
    return (
      <sphereGeometry args={[1, 32, 32]} />
    );
  };

  if (config.geometry === 'kidney') {
    return (
      <group position={config.position} onClick={onClick}>
        {getGeometry()}
      </group>
    );
  }

  return (
    <mesh
      ref={meshRef}
      position={config.position}
      scale={config.scale}
      onClick={onClick}
    >
      {getGeometry()}
      <meshPhysicalMaterial
        color={config.color}
        emissive={glowColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.1}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
        transmission={0.15}
        thickness={0.5}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

function HumanTorso() {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color="#FFDAB9"
          roughness={0.6}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 16]} />
        <meshPhysicalMaterial
          color="#FFDAB9"
          roughness={0.6}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.55, 1.6, 16, 32]} />
        <meshPhysicalMaterial
          color="#FFDAB9"
          roughness={0.5}
          metalness={0}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ribcage outline */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[0, 1.3 - i * 0.15, 0.35]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.35 + i * 0.02, 0.015, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#E8DCC4" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Spine */}
      {[...Array(12)].map((_, i) => (
        <mesh key={`spine-${i}`} position={[0, 1.5 - i * 0.18, -0.35]}>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color="#E8DCC4" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

interface Scene3DProps {
  burdens: OrganBurden[];
  selectedOrgan: OrganId | null;
  onOrganClick: (organId: OrganId | null) => void;
}

function Scene3D({ burdens, selectedOrgan, onOrganClick }: Scene3DProps) {
  const burdenMap = burdens.reduce((acc, b) => {
    acc[b.organId] = b;
    return acc;
  }, {} as Record<OrganId, OrganBurden>);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#B8C4CE" />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />
      
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
        <group>
          <HumanTorso />
          
          {(Object.keys(organConfigs) as OrganId[]).map((organId) => (
            <OrganMesh
              key={organId}
              organId={organId}
              config={organConfigs[organId]}
              burden={burdenMap[organId]}
              isSelected={selectedOrgan === organId}
              onClick={() => onOrganClick(organId === selectedOrgan ? null : organId)}
            />
          ))}
        </group>
      </Float>

      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading 3D visualization...</p>
      </div>
    </Html>
  );
}

export function OrganVisualizer({ burdens }: OrganVisualizerProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId | null>(null);
  
  const burdenMap = burdens.reduce((acc, b) => {
    acc[b.organId] = b;
    return acc;
  }, {} as Record<OrganId, OrganBurden>);

  const selectedBurden = selectedOrgan ? burdenMap[selectedOrgan] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center animate-slide-up">
      {/* 3D Human body visualization */}
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden glass-card">
        <Canvas
          camera={{ position: [0, 1, 5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1219 100%)' }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Scene3D
              burdens={burdens}
              selectedOrgan={selectedOrgan}
              onOrganClick={setSelectedOrgan}
            />
          </Suspense>
        </Canvas>
        
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-white/60 backdrop-blur-sm bg-black/30 rounded-lg px-3 py-2">
            Drag to rotate • Scroll to zoom • Click organs for details
          </p>
        </div>
      </div>

      {/* Organ detail panel */}
      <div className="w-full max-w-sm">
        {selectedBurden ? (
          <div className="glass-card rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">
                {organInfo[selectedBurden.organId].name}
              </h3>
              <span className={cn(
                'burden-pill',
                selectedBurden.level === 'low' && 'burden-pill-low',
                selectedBurden.level === 'medium' && 'burden-pill-medium',
                selectedBurden.level === 'high' && 'burden-pill-high',
                selectedBurden.level === 'critical' && 'burden-pill-critical',
                selectedBurden.level === 'none' && 'bg-muted text-muted-foreground',
              )}>
                {selectedBurden.level === 'none' ? 'No burden' : `${selectedBurden.level.charAt(0).toUpperCase() + selectedBurden.level.slice(1)} burden`}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {organInfo[selectedBurden.organId].description}
            </p>
            
            {selectedBurden.medicines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Contributing medicines ({selectedBurden.medicineCount}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBurden.medicines.map((med, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Select an organ
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on any organ in the 3D model to see detailed burden information.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 glass-card rounded-xl p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Burden Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#4a5568]" />
              <span className="text-muted-foreground">No burden</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#68D391] shadow-[0_0_8px_#68D391]" />
              <span className="text-muted-foreground">Low (1 med)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F6E05E] shadow-[0_0_8px_#F6E05E]" />
              <span className="text-muted-foreground">Medium (2 meds)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F6AD55] shadow-[0_0_10px_#F6AD55]" />
              <span className="text-muted-foreground">High (3 meds)</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-4 h-4 rounded-full bg-[#FC8181] shadow-[0_0_12px_#FC8181]" />
              <span className="text-muted-foreground">Critical (4+ meds)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Organ visuals are illustrative representations for educational understanding.
        </p>
      </div>
    </div>
  );
}
