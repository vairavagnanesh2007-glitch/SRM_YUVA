import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Building2, 
  Layers, 
  Clock, 
  Users, 
  Wind, 
  Tv, 
  Volume2, 
  RotateCw, 
  Maximize2, 
  ChevronRight,
  Eye,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Campus3DMap({ rooms, selectedFloor, onSelectFloor, onSelectRoom }) {
  const mountRef = useRef(null);
  const [hoveredRoomData, setHoveredRoomData] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewAngle, setViewAngle] = useState('isometric'); // 'isometric' | 'front' | 'top'

  // References to Three.js scene elements for dynamic updates
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const roomMeshesRef = useRef([]);
  const slabMeshesRef = useRef([]);
  const coreMeshRef = useRef(null);

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(22, 20, 24);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip under ground
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 6, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(25, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    fillLight.position.set(-20, 15, -15);
    scene.add(fillLight);

    // Plinth Ground Slab
    const groundGeo = new THREE.CylinderGeometry(18, 19, 0.6, 64);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0, 
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground Grid
    const grid = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    grid.position.y = 0.01;
    scene.add(grid);

    // Central elevator / services spine core
    const coreGeo = new THREE.BoxGeometry(2.5, 14, 2.5);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 7, 0);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Raycasting for mouse interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshesRef.current);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        if (hitMesh.userData && hitMesh.userData.room) {
          setHoveredRoomData(hitMesh.userData.room);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredRoomData(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshesRef.current);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        if (hitMesh.userData && hitMesh.userData.room && onSelectRoom) {
          onSelectRoom(hitMesh.userData.room);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('click', onClick);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('click', onClick);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update building blocks based on rooms data, selectedFloor, and isExploded state
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing room and slab meshes
    roomMeshesRef.current.forEach(mesh => {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    roomMeshesRef.current = [];

    slabMeshesRef.current.forEach(mesh => {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    slabMeshesRef.current = [];

    // Group rooms by floor (1 to 7)
    const floorGroups = {};
    for (let f = 1; f <= 7; f++) {
      floorGroups[f] = rooms.filter(r => r.floor === f);
    }

    const baseFloorHeight = 1.8;
    const explodeFactor = isExploded ? 1.9 : 1.0;

    // Build building blocks per floor
    for (let f = 1; f <= 7; f++) {
      const floorRooms = floorGroups[f] || [];
      const floorY = (f - 1) * (baseFloorHeight * explodeFactor) + 0.8;

      const isCurrentFloor = selectedFloor === null || selectedFloor === undefined || selectedFloor === f;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(11, 0.22, 10);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isCurrentFloor ? 0xf1f5f9 : 0xe2e8f0,
        roughness: 0.7,
        metalness: 0.1,
        transparent: selectedFloor !== null && !isCurrentFloor,
        opacity: selectedFloor !== null && !isCurrentFloor ? 0.35 : 1.0
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, floorY, 0);
      slab.receiveShadow = true;
      slab.castShadow = true;
      scene.add(slab);
      slabMeshesRef.current.push(slab);

      // Floor Slab Wireframe Outline
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabLine = new THREE.LineSegments(slabEdges, new THREE.LineBasicMaterial({ 
        color: 0x94a3b8, 
        transparent: true, 
        opacity: isCurrentFloor ? 0.5 : 0.2 
      }));
      slab.add(slabLine);

      // Position rooms on this floor
      // We arrange up to 3-4 rooms around the central core in a clean architectural layout
      const roomLayoutOffsets = [
        { x: -3.3, z: -2.7, w: 3.6, d: 3.2 },
        { x: 3.3, z: -2.7, w: 3.6, d: 3.2 },
        { x: -3.3, z: 2.7, w: 3.6, d: 3.2 },
        { x: 3.3, z: 2.7, w: 3.6, d: 3.2 }
      ];

      floorRooms.forEach((room, idx) => {
        const layout = roomLayoutOffsets[idx % roomLayoutOffsets.length];
        const blockHeight = baseFloorHeight * 0.75;
        const roomY = floorY + blockHeight / 2 + 0.11;

        // Determine building block color based on occupancy status
        let blockColor = 0x334155;
        let emissiveColor = 0x0f172a;
        let emissiveIntensity = 0.1;
        let blockOpacity = isCurrentFloor ? 0.92 : 0.25;

        if (room.status === 'FREE') {
          blockColor = 0x10b981; // Emerald Green
          emissiveColor = 0x059669;
          emissiveIntensity = 0.35;
        } else if (room.status === 'ENDING_SOON') {
          blockColor = 0xf59e0b; // Amber / Yellow
          emissiveColor = 0xd97706;
          emissiveIntensity = 0.5;
        } else {
          blockColor = 0x475569; // Occupied Slate
          emissiveColor = 0x1e293b;
          emissiveIntensity = 0.1;
        }

        const roomGeo = new THREE.BoxGeometry(layout.w, blockHeight, layout.d);
        const roomMat = new THREE.MeshStandardMaterial({
          color: blockColor,
          roughness: 0.3,
          metalness: 0.1,
          emissive: emissiveColor,
          emissiveIntensity: emissiveIntensity,
          transparent: true,
          opacity: blockOpacity
        });

        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.position.set(layout.x, roomY, layout.z);
        roomMesh.castShadow = true;
        roomMesh.receiveShadow = true;
        roomMesh.userData = { room, floor: f };

        // Clean architectural block edge lines
        const edges = new THREE.EdgesGeometry(roomGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ 
          color: room.status === 'FREE' ? 0x047857 : room.status === 'ENDING_SOON' ? 0xb45309 : 0x1e293b,
          transparent: true,
          opacity: isCurrentFloor ? 0.8 : 0.2
        }));
        roomMesh.add(line);

        scene.add(roomMesh);
        roomMeshesRef.current.push(roomMesh);
      });
    }

    // Adjust core spine height
    if (coreMeshRef.current) {
      const topFloorY = 7 * (baseFloorHeight * explodeFactor);
      coreMeshRef.current.position.y = topFloorY / 2;
      coreMeshRef.current.scale.y = explodeFactor;
    }
  }, [rooms, selectedFloor, isExploded]);

  // Handle Camera Presets
  const setCameraView = (type) => {
    setViewAngle(type);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (type === 'isometric') {
      camera.position.set(22, 20, 24);
      controls.target.set(0, 6, 0);
    } else if (type === 'front') {
      camera.position.set(0, 8, 30);
      controls.target.set(0, 7, 0);
    } else if (type === 'top') {
      camera.position.set(0, 36, 0.1);
      controls.target.set(0, 6, 0);
    }
    controls.update();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs relative">
      
      {/* 3D Model Top Command Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                IST Building 3D Blocks Model
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Interactive Three.js
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Drag to rotate 360° • Scroll to zoom • Click any block to view countdown
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
          
          {/* Explode / Stack Building Blocks */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isExploded 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Stack Blocks' : 'Explode Floors'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
              autoRotate 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Auto-rotate 3D model"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate</span>
          </button>

          {/* Camera Angles */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCameraView('isometric')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewAngle === 'isometric'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraView('front')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewAngle === 'front'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Facade
            </button>
            <button
              onClick={() => setCameraView('top')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewAngle === 'top'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top Plan
            </button>
          </div>
        </div>
      </div>

      {/* Floor Filter Strip & Status Legend */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        
        {/* Clean Status Legend with solid color indicator dots */}
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Block Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-semibold text-emerald-800">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="font-semibold text-amber-800">Ending Soon (&lt;30m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-600">In Session</span>
          </div>
        </div>

        {/* Floor Selection Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="text-slate-400 font-semibold mr-1 text-[11px]">Filter Floor:</span>
          <button
            onClick={() => onSelectFloor(null)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
              selectedFloor === null
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map(f => (
            <button
              key={f}
              onClick={() => onSelectFloor(f)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                selectedFloor === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f === 1 ? 'GF' : `L${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* THREE.JS 3D CANVAS CONTAINER */}
      <div 
        ref={mountRef} 
        className="w-full h-[540px] bg-slate-50 relative cursor-grab active:cursor-grabbing outline-none"
      >
        {/* Floating Tooltip Callout on Block Hover */}
        {hoveredRoomData && (
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-extrabold text-slate-900 text-base">
                {hoveredRoomData.name}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                hoveredRoomData.status === 'FREE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : hoveredRoomData.status === 'ENDING_SOON'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  hoveredRoomData.status === 'FREE' ? 'bg-emerald-500' : hoveredRoomData.status === 'ENDING_SOON' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                <span>{hoveredRoomData.status === 'FREE' ? 'Available' : hoveredRoomData.status === 'ENDING_SOON' ? 'Ending Soon' : 'In Session'}</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 mb-2">
              {hoveredRoomData.floorLabel} • {hoveredRoomData.type}
            </div>

            <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-bold">{hoveredRoomData.capacity} Desks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timing:</span>
                <span className="font-bold text-emerald-700">
                  {hoveredRoomData.status === 'FREE' ? `Clear until ${hoveredRoomData.freeUntil}` : `In use until ${hoveredRoomData.freeUntil}`}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-indigo-600 mt-2 block text-center">
              Click block to inspect & call squad →
            </span>
          </div>
        )}

        {/* Instructions Overlay Helper */}
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            Left Click: Rotate • Scroll: Zoom • Right Click: Pan
          </span>
        </div>
      </div>
    </div>
  );
}
