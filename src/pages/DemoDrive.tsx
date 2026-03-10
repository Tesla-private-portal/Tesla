import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// Advanced Audio Context for EV Sound & Environment
class EVSound {
  ctx: AudioContext | null = null;
  osc: OscillatorNode | null = null;
  gain: GainNode | null = null;
  windGain: GainNode | null = null;
  screechGain: GainNode | null = null;
  initialized = false;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // EV Motor Whine
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sine';
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.osc.start();

      // Wind/Road noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0;
      
      noise.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      noise.start();

      // Tire Screeching
      const screechBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const screechData = screechBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        screechData[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.5);
      }
      const screechSource = this.ctx.createBufferSource();
      screechSource.buffer = screechBuffer;
      screechSource.loop = true;
      
      const screechFilter = this.ctx.createBiquadFilter();
      screechFilter.type = 'bandpass';
      screechFilter.frequency.value = 2500;
      
      this.screechGain = this.ctx.createGain();
      this.screechGain.gain.value = 0;
      
      screechSource.connect(screechFilter);
      screechFilter.connect(this.screechGain);
      this.screechGain.connect(this.ctx.destination);
      screechSource.start();

      this.initialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  update(speed: number, isAccelerating: boolean, isBraking: boolean, steer: number) {
    if (!this.initialized || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Motor Whine
    const targetFreq = 200 + speed * 1000;
    const targetVol = isAccelerating ? 0.15 + speed * 0.1 : speed * 0.05;
    this.osc?.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.gain?.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
    
    // Wind & Road Noise
    const windVol = speed * speed * 0.2;
    this.windGain?.gain.setTargetAtTime(windVol, this.ctx.currentTime, 0.2);

    // Tire Screech (Hard braking or hard steering at speed)
    const isScreeching = (isBraking && speed > 0.8) || (Math.abs(steer) > 0.5 && speed > 1.2);
    const targetScreech = isScreeching ? Math.min(speed * 0.15, 0.4) : 0;
    this.screechGain?.gain.setTargetAtTime(targetScreech, this.ctx.currentTime, 0.1);
  }

  stop() {
    if (!this.initialized || !this.ctx) return;
    this.gain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    this.windGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    this.screechGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
  }
}

const evSound = new EVSound();

function Car({ color, wheelType, speed, steer, isBraking, isAccelerating }: { color: string, wheelType: string, speed: number, steer: number, isBraking: boolean, isAccelerating: boolean }) {
  const group = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    
    // Chassis vibration based on speed and road noise
    const vibration = speed > 0.1 ? Math.sin(t * 30) * (speed * 0.005) : 0;
    group.current.position.y = 0.5 + vibration;
    
    // Dynamic Physics: Body roll (steering) and Pitch (acceleration/braking dive)
    const targetRoll = -steer * 0.08 * speed;
    const targetPitch = isAccelerating ? 0.02 : (isBraking ? -0.05 : 0);
    
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRoll, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetPitch, 0.1);

    // Rotate wheels
    wheels.current.forEach((wheel, i) => {
      if (wheel) {
        wheel.rotation.x -= speed * 0.5;
        // Steer front wheels
        if (i < 2) {
          wheel.rotation.y = steer * 0.4;
        } else {
          wheel.rotation.y = 0;
        }
      }
    });
  });

  const brakeIntensity = isBraking ? 15 : 2;
  const brakeColor = isBraking ? "#ff1111" : "#550000";

  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {/* Car Body */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.8, 4.8]} />
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.15} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Car Cabin / Glass */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2.6]} />
        <meshPhysicalMaterial 
          color="#050505" 
          metalness={0.9} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.5}
        />
      </mesh>
      
      {/* Wheels */}
      {[-1.1, 1.1].map((x, i) => 
        [-1.6, 1.5].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.1, z]}>
            <mesh 
              ref={(el) => { if (el) wheels.current[i * 2 + j] = el; }} 
              rotation={[0, 0, Math.PI / 2]} 
              castShadow
            >
              <cylinderGeometry args={[0.45, 0.45, 0.35, 32]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
              
              {/* Rims based on wheelType */}
              <mesh position={[0, x > 0 ? 0.18 : -0.18, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.05, wheelType === 'sport' ? 5 : 10]} />
                <meshStandardMaterial color={wheelType === 'dark' ? '#222' : '#ccc'} metalness={0.8} roughness={0.2} />
              </mesh>
            </mesh>
          </group>
        ))
      )}
      
      {/* Headlights */}
      <mesh position={[0.8, 0.5, 2.41]}>
        <boxGeometry args={[0.5, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
        <pointLight color="#ffffff" intensity={2} distance={15} position={[0, 0, 0.5]} />
      </mesh>
      <mesh position={[-0.8, 0.5, 2.41]}>
        <boxGeometry args={[0.5, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
        <pointLight color="#ffffff" intensity={2} distance={15} position={[0, 0, 0.5]} />
      </mesh>
      
      {/* Dynamic Taillights */}
      <mesh position={[0.8, 0.6, -2.41]}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color={brakeColor} emissive="#ff0000" emissiveIntensity={brakeIntensity} toneMapped={false} />
        <pointLight color="#ff0000" intensity={isBraking ? 5 : 1} distance={isBraking ? 10 : 5} position={[0, 0, -0.5]} />
      </mesh>
      <mesh position={[-0.8, 0.6, -2.41]}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color={brakeColor} emissive="#ff0000" emissiveIntensity={brakeIntensity} toneMapped={false} />
        <pointLight color="#ff0000" intensity={isBraking ? 5 : 1} distance={isBraking ? 10 : 5} position={[0, 0, -0.5]} />
      </mesh>
    </group>
  );
}

function Road({ speed }: { speed: number }) {
  const roadRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!roadRef.current) return;
    if (roadRef.current.material instanceof THREE.MeshStandardMaterial && roadRef.current.material.map) {
      roadRef.current.material.map.offset.y -= speed * 0.05;
    }
  });

  const roadTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      // Asphalt base
      context.fillStyle = '#1a1a1a';
      context.fillRect(0, 0, 512, 512);
      
      // Center dashed line
      context.fillStyle = '#ffffff';
      context.fillRect(250, 0, 12, 256);
      
      // Solid side lines
      context.fillStyle = '#dddddd';
      context.fillRect(20, 0, 10, 512);
      context.fillRect(482, 0, 10, 512);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 20);
    return tex;
  }, []);

  return (
    <mesh ref={roadRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 200]} />
      <meshStandardMaterial map={roadTexture} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function Guardrails({ speed }: { speed: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    group.current.children.forEach((child) => {
      child.position.z -= speed * 1.5;
      if (child.position.z < -50) child.position.z += 100;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i} position={[0, 0, i * 5 - 50]}>
          {/* Left Guardrail */}
          <mesh position={[-4.5, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.2, 5]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-4.6, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          
          {/* Right Guardrail */}
          <mesh position={[4.5, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.2, 5]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[4.6, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CitySkyline({ speed }: { speed: number }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!group.current) return;
    // Parallax effect: distant objects move slower
    group.current.position.z -= speed * 0.2; 
    if (group.current.position.z < -100) group.current.position.z += 100;
  });

  const buildings = useMemo(() => {
    return Array.from({ length: 50 }).map(() => {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (30 + Math.random() * 60);
      const z = Math.random() * 200 - 100;
      const width = 4 + Math.random() * 8;
      const depth = 4 + Math.random() * 8;
      const height = 15 + Math.random() * 60;
      return { x, z, width, depth, height };
    });
  }, []);

  return (
    <group ref={group}>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.height / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function DemoDrive() {
  const [color, setColor] = useState('#ffffff');
  const [wheelType, setWheelType] = useState('aero');
  const [speed, setSpeed] = useState(0);
  const [steer, setSteer] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [started, setStarted] = useState(false);

  // Advanced Physics & Controls loop
  useEffect(() => {
    let animationFrameId: number;
    
    const updatePhysics = () => {
      setSpeed(s => {
        let newSpeed = s;
        const drag = 0.002 * s * s; // Aerodynamic drag
        const friction = 0.005;     // Rolling resistance
        
        if (isAccelerating) {
          newSpeed += 0.025; // Acceleration force
        } else if (isBraking) {
          newSpeed -= 0.08;  // Strong braking force
        } else {
          newSpeed -= friction; // Coasting
        }
        
        newSpeed -= drag;
        newSpeed = Math.max(0, Math.min(newSpeed, 2.5)); // Clamp speed (0 to ~150mph equivalent)
        
        if (started) {
          evSound.update(newSpeed, isAccelerating, isBraking, steer);
        }
        
        return newSpeed;
      });
      
      animationFrameId = requestAnimationFrame(updatePhysics);
    };
    
    updatePhysics();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAccelerating, isBraking, steer, started]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started) return;
      if (e.key === 'ArrowUp' || e.key === 'w') setIsAccelerating(true);
      if (e.key === 'ArrowDown' || e.key === 's') setIsBraking(true);
      if (e.key === 'ArrowLeft' || e.key === 'a') setSteer(1);
      if (e.key === 'ArrowRight' || e.key === 'd') setSteer(-1);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') setIsAccelerating(false);
      if (e.key === 'ArrowDown' || e.key === 's') setIsBraking(false);
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) setSteer(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      evSound.stop();
    };
  }, [started]);

  const startEngine = () => {
    evSound.init();
    setStarted(true);
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col md:flex-row pt-16 md:pt-0">
      
      {/* 3D Canvas Area */}
      <div className="flex-1 relative h-full">
        {!started && (
          <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-medium text-white mb-4">Ready to Drive?</h2>
              <button 
                onClick={startEngine}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Start Engine
              </button>
            </div>
          </div>
        )}

        {/* Touch Controls for Mobile */}
        {started && (
          <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-between px-8 md:hidden pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
              <button 
                onPointerDown={() => setSteer(1)} 
                onPointerUp={() => setSteer(0)}
                onPointerLeave={() => setSteer(0)}
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-white/30 text-2xl"
              >
                ←
              </button>
              <button 
                onPointerDown={() => setSteer(-1)} 
                onPointerUp={() => setSteer(0)}
                onPointerLeave={() => setSteer(0)}
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-white/30 text-2xl"
              >
                →
              </button>
            </div>
            <div className="flex gap-4 pointer-events-auto">
              <button 
                onPointerDown={() => setIsBraking(true)} 
                onPointerUp={() => setIsBraking(false)}
                onPointerLeave={() => setIsBraking(false)}
                className="w-16 h-16 bg-red-500/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-red-500/80 font-medium"
              >
                Brake
              </button>
              <button 
                onPointerDown={() => setIsAccelerating(true)} 
                onPointerUp={() => setIsAccelerating(false)}
                onPointerLeave={() => setIsAccelerating(false)}
                className="w-16 h-16 bg-green-500/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-green-500/80 font-medium"
              >
                Gas
              </button>
            </div>
          </div>
        )}

        {/* Speedometer UI */}
        {started && (
          <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end pointer-events-none hidden md:flex">
            <div className="text-7xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] font-mono">
              {Math.round(speed * 60)}
            </div>
            <div className="text-gray-400 text-xl font-medium tracking-widest uppercase">
              MPH
            </div>
          </div>
        )}

        <Canvas shadows camera={{ position: [0, 3, -8], fov: 50 }}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 80]} />
          
          <ambientLight intensity={0.2} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <spotLight position={[-10, 10, -10]} intensity={2} color="#4488ff" />
          
          <Car color={color} wheelType={wheelType} speed={speed} steer={steer} isBraking={isBraking} isAccelerating={isAccelerating} />
          <Road speed={speed} />
          <Guardrails speed={speed} />
          <CitySkyline speed={speed} />
          
          <ContactShadows position={[0, 0.01, 0]} opacity={0.8} scale={15} blur={1.5} far={4} resolution={1024} />
          <Environment preset="night" />
          
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={5}
            maxDistance={15}
          />
          
          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Customization Sidebar */}
      <div className="w-full md:w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-8 z-10 overflow-y-auto">
        <div>
          <h2 className="text-xl font-medium text-white mb-6">Customize</h2>
          
          <div className="mb-8">
            <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Paint</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { name: 'Pearl White', value: '#ffffff' },
                { name: 'Solid Black', value: '#111111' },
                { name: 'Deep Blue', value: '#003366' },
                { name: 'Ultra Red', value: '#cc0000' },
                { name: 'Stealth Grey', value: '#333333' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${color === c.value ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Wheels</h3>
            <div className="flex flex-col gap-3">
              {[
                { id: 'aero', name: '18" Aero Wheels' },
                { id: 'sport', name: '19" Sport Wheels' },
                { id: 'dark', name: '20" Überturbine' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWheelType(w.id)}
                  className={`px-4 py-3 rounded-md text-left text-sm transition-colors ${wheelType === w.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto bg-gray-800 p-4 rounded-lg hidden md:block">
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Controls</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li><kbd className="bg-gray-700 px-2 py-1 rounded">W</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> Accelerate</li>
            <li><kbd className="bg-gray-700 px-2 py-1 rounded">S</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd> Brake</li>
            <li><kbd className="bg-gray-700 px-2 py-1 rounded">A</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">D</kbd> Steer</li>
            <li><span className="text-blue-400">Drag</span> to rotate camera</li>
            <li><span className="text-blue-400">Scroll</span> to zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
