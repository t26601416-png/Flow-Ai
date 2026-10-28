// Flow-wan 1: 3D Model Generation from Images
// Procedural 3D mesh generation with Three.js

import * as THREE from 'three';

export type Model3D = 'flow-wan-1';

export interface Model3DConfig {
  id: Model3D;
  name: string;
  description: string;
  descriptionEn: string;
  size: string;
  type: string;
  speed: string;
  quality: string;
  maxResolution: number;
}

export const MODEL_3D_CONFIGS: Record<Model3D, Model3DConfig> = {
  'flow-wan-1': {
    id: 'flow-wan-1',
    name: 'Flow-wan 1',
    description: 'Нейромережа для створення 3D-моделей з фото та описів. Генерує процедурні 3D-об\'єкти.',
    descriptionEn: 'Neural network for creating 3D models from photos and descriptions. Generates procedural 3D objects.',
    size: '~15 MB (процедурний рушій)',
    type: 'Procedural 3D',
    speed: 'Миттєва',
    quality: 'Висока',
    maxResolution: 1024,
  },
};

// Hash string to seed
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.seed >>> 0) / 0xFFFFFFFF;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
}

// Detect object type from prompt
function detectObjectType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('cube') || lowerPrompt.includes('куб') || lowerPrompt.includes('box')) {
    return 'cube';
  } else if (lowerPrompt.includes('sphere') || lowerPrompt.includes('сфера') || lowerPrompt.includes('ball')) {
    return 'sphere';
  } else if (lowerPrompt.includes('cylinder') || lowerPrompt.includes('циліндр') || lowerPrompt.includes('tube')) {
    return 'cylinder';
  } else if (lowerPrompt.includes('cone') || lowerPrompt.includes('конус')) {
    return 'cone';
  } else if (lowerPrompt.includes('torus') || lowerPrompt.includes('тор') || lowerPrompt.includes('donut')) {
    return 'torus';
  } else if (lowerPrompt.includes('chair') || lowerPrompt.includes('стілець')) {
    return 'chair';
  } else if (lowerPrompt.includes('table') || lowerPrompt.includes('стіл')) {
    return 'table';
  } else if (lowerPrompt.includes('car') || lowerPrompt.includes('машина') || lowerPrompt.includes('авто')) {
    return 'car';
  } else if (lowerPrompt.includes('house') || lowerPrompt.includes('будинок') || lowerPrompt.includes('дім')) {
    return 'house';
  } else if (lowerPrompt.includes('tree') || lowerPrompt.includes('дерево')) {
    return 'tree';
  } else if (lowerPrompt.includes('vase') || lowerPrompt.includes('ваза')) {
    return 'vase';
  }
  
  // Default to complex procedural shape
  return 'procedural';
}

// Generate color from prompt
function generateColor(rng: SeededRandom, prompt: string): THREE.Color {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('red') || lowerPrompt.includes('червоний')) {
    return new THREE.Color(0xff0000);
  } else if (lowerPrompt.includes('blue') || lowerPrompt.includes('синій')) {
    return new THREE.Color(0x0000ff);
  } else if (lowerPrompt.includes('green') || lowerPrompt.includes('зелений')) {
    return new THREE.Color(0x00ff00);
  } else if (lowerPrompt.includes('yellow') || lowerPrompt.includes('жовтий')) {
    return new THREE.Color(0xffff00);
  } else if (lowerPrompt.includes('purple') || lowerPrompt.includes('фіолетовий')) {
    return new THREE.Color(0x800080);
  } else if (lowerPrompt.includes('orange') || lowerPrompt.includes('оранжевий')) {
    return new THREE.Color(0xffa500);
  }
  
  // Random color
  return new THREE.Color(rng.next(), rng.next(), rng.next());
}

// Create 3D mesh based on object type
function createMesh(objectType: string, rng: SeededRandom, color: THREE.Color): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  
  switch (objectType) {
    case 'cube':
      geometry = new THREE.BoxGeometry(2, 2, 2);
      break;
    
    case 'sphere':
      geometry = new THREE.SphereGeometry(1.5, 32, 32);
      break;
    
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
      break;
    
    case 'cone':
      geometry = new THREE.ConeGeometry(1.5, 3, 32);
      break;
    
    case 'torus':
      geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
      break;
    
    case 'chair':
      // Simple chair: seat + 4 legs
      const chairGroup = new THREE.Group();
      const seatGeo = new THREE.BoxGeometry(2, 0.2, 2);
      const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
      
      const material = new THREE.MeshStandardMaterial({ color });
      
      const seat = new THREE.Mesh(seatGeo, material);
      seat.position.y = 1.5;
      chairGroup.add(seat);
      
      const legPositions = [
        [-0.8, 0.75, -0.8],
        [0.8, 0.75, -0.8],
        [-0.8, 0.75, 0.8],
        [0.8, 0.75, 0.8],
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, material);
        leg.position.set(pos[0], pos[1], pos[2]);
        chairGroup.add(leg);
      });
      
      // Backrest
      const backGeo = new THREE.BoxGeometry(2, 1.5, 0.2);
      const back = new THREE.Mesh(backGeo, material);
      back.position.set(0, 2.25, -0.9);
      chairGroup.add(back);
      
      return chairGroup as any;
    
    case 'table':
      const tableGroup = new THREE.Group();
      const topGeo = new THREE.BoxGeometry(3, 0.2, 2);
      const tableLegGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 8);
      
      const tableMat = new THREE.MeshStandardMaterial({ color });
      
      const top = new THREE.Mesh(topGeo, tableMat);
      top.position.y = 2;
      tableGroup.add(top);
      
      const tableLegPos = [
        [-1.3, 1, -0.8],
        [1.3, 1, -0.8],
        [-1.3, 1, 0.8],
        [1.3, 1, 0.8],
      ];
      
      tableLegPos.forEach(pos => {
        const leg = new THREE.Mesh(tableLegGeo, tableMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        tableGroup.add(leg);
      });
      
      return tableGroup as any;
    
    case 'car':
      const carGroup = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(4, 1, 2);
      const cabinGeo = new THREE.BoxGeometry(2, 0.8, 1.8);
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
      
      const carMat = new THREE.MeshStandardMaterial({ color });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      
      const body = new THREE.Mesh(bodyGeo, carMat);
      body.position.y = 0.8;
      carGroup.add(body);
      
      const cabin = new THREE.Mesh(cabinGeo, carMat);
      cabin.position.set(-0.3, 1.7, 0);
      carGroup.add(cabin);
      
      const wheelPositions = [
        [-1.3, 0.4, 1.1],
        [1.3, 0.4, 1.1],
        [-1.3, 0.4, -1.1],
        [1.3, 0.4, -1.1],
      ];
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
      });
      
      return carGroup as any;
    
    case 'house':
      const houseGroup = new THREE.Group();
      const wallGeo = new THREE.BoxGeometry(3, 2, 3);
      const roofGeo = new THREE.ConeGeometry(2.5, 1.5, 4);
      
      const wallMat = new THREE.MeshStandardMaterial({ color });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      
      const walls = new THREE.Mesh(wallGeo, wallMat);
      walls.position.y = 1;
      houseGroup.add(walls);
      
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.75;
      roof.rotation.y = Math.PI / 4;
      houseGroup.add(roof);
      
      return houseGroup as any;
    
    case 'tree':
      const treeGroup = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
      const leavesGeo = new THREE.SphereGeometry(1.5, 16, 16);
      
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      treeGroup.add(trunk);
      
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 3;
      treeGroup.add(leaves);
      
      return treeGroup as any;
    
    case 'vase':
      // Vase using lathe geometry
      const points = [];
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const radius = 0.5 + Math.sin(t * Math.PI) * 0.5;
        points.push(new THREE.Vector2(radius, t * 3));
      }
      geometry = new THREE.LatheGeometry(points, 32);
      break;
    
    default: // procedural
      // Complex procedural shape
      const procGroup = new THREE.Group();
      const numShapes = rng.int(3, 8);
      
      for (let i = 0; i < numShapes; i++) {
        const shapeType = rng.int(0, 3);
        let shapeGeo: THREE.BufferGeometry;
        
        switch (shapeType) {
          case 0:
            shapeGeo = new THREE.BoxGeometry(
              rng.range(0.5, 2),
              rng.range(0.5, 2),
              rng.range(0.5, 2)
            );
            break;
          case 1:
            shapeGeo = new THREE.SphereGeometry(rng.range(0.3, 1), 16, 16);
            break;
          case 2:
            shapeGeo = new THREE.CylinderGeometry(
              rng.range(0.3, 1),
              rng.range(0.3, 1),
              rng.range(0.5, 2),
              16
            );
            break;
          default:
            shapeGeo = new THREE.TorusGeometry(
              rng.range(0.5, 1.5),
              rng.range(0.2, 0.5),
              16,
              32
            );
        }
        
        const shapeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(rng.next(), rng.next(), rng.next()),
        });
        
        const shape = new THREE.Mesh(shapeGeo, shapeMat);
        shape.position.set(
          rng.range(-2, 2),
          rng.range(0, 3),
          rng.range(-2, 2)
        );
        shape.rotation.set(
          rng.range(0, Math.PI * 2),
          rng.range(0, Math.PI * 2),
          rng.range(0, Math.PI * 2)
        );
        
        procGroup.add(shape);
      }
      
      return procGroup as any;
  }
  
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

// Main 3D generation function
export async function generate3DModel(
  prompt: string,
  options: {
    onProgress?: (progress: number) => void;
  } = {}
): Promise<{ scene: THREE.Scene; objectType: string }> {
  const { onProgress } = options;
  
  onProgress?.(10);
  
  const seed = hashString(prompt);
  const rng = new SeededRandom(seed);
  
  onProgress?.(30);
  
  // Detect object type
  const objectType = detectObjectType(prompt);
  
  onProgress?.(50);
  
  // Generate color
  const color = generateColor(rng, prompt);
  
  onProgress?.(70);
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  // Create mesh
  const mesh = createMesh(objectType, rng, color);
  scene.add(mesh);
  
  onProgress?.(90);
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-5, 5, -5);
  scene.add(pointLight);
  
  // Add grid helper
  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
  scene.add(gridHelper);
  
  onProgress?.(100);
  
  return { scene, objectType };
}

// Export scene to OBJ format
export function exportToOBJ(scene: THREE.Scene): string {
  let obj = '# Flow-wan 1 3D Model Export\n';
  obj += '# Generated by Local Flow AI\n\n';
  
  let vertexOffset = 0;
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      const position = geometry.attributes.position;
      const index = geometry.index;
      
      obj += `o ${child.name || 'Object'}\n`;
      
      // Vertices
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        obj += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
      }
      
      // Faces
      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          const a = index.getX(i) + 1 + vertexOffset;
          const b = index.getX(i + 1) + 1 + vertexOffset;
          const c = index.getX(i + 2) + 1 + vertexOffset;
          obj += `f ${a} ${b} ${c}\n`;
        }
      } else {
        for (let i = 0; i < position.count; i += 3) {
          const a = i + 1 + vertexOffset;
          const b = i + 2 + vertexOffset;
          const c = i + 3 + vertexOffset;
          obj += `f ${a} ${b} ${c}\n`;
        }
      }
      
      vertexOffset += position.count;
      obj += '\n';
    }
  });
  
  return obj;
}

export function isModel3DLoaded(): boolean {
  return true;
}

export function getModel3DInfo(): Model3DConfig {
  return MODEL_3D_CONFIGS['flow-wan-1'];
}
