/**
 * 离线检查 GLB 模型中手臂骨骼的世界坐标位置。
 * 使用 Three.js GLTFLoader 加载模型，计算骨骼世界矩阵，
 * 从而判断手臂是否处于自然下垂位置。
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadGLTF(filePath) {
  const buffer = readFileSync(filePath);
  // Buffer -> ArrayBuffer
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(arrayBuffer, '', (gltf) => {
      resolve(gltf);
    }, (error) => {
      reject(error);
    });
  });
}

function getWorldPosition(obj) {
  obj.updateWorldMatrix(true, false);
  const pos = new THREE.Vector3();
  obj.getWorldPosition(pos);
  return pos;
}

async function analyzeModel(label, filePath) {
  console.log(`\n=== ${label} ===`);
  let gltf;
  try {
    gltf = await loadGLTF(filePath);
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err.message);
    return null;
  }

  const scene = gltf.scene;
  let skeleton = null;
  scene.traverse((child) => {
    if (child.isSkinnedMesh) {
      skeleton = child.skeleton;
    }
  });

  if (!skeleton) {
    console.error('No skeleton found!');
    return null;
  }

  console.log(`Bones: ${skeleton.bones.length}`);

  const armBones = [
    'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftWrist', 'LeftHand',
    'RightShoulder', 'RightArm', 'RightForeArm', 'RightWrist', 'RightHand'
  ];

  const result = {};
  for (const boneName of armBones) {
    const bone = skeleton.bones.find(b => b.name === boneName);
    if (!bone) {
      console.log(`${boneName}: NOT FOUND`);
      result[boneName] = null;
      continue;
    }
    const pos = getWorldPosition(bone);
    const quat = bone.quaternion;
    result[boneName] = { x: pos.x, y: pos.y, z: pos.z, qx: quat.x, qy: quat.y, qz: quat.z, qw: quat.w };
    console.log(`${boneName}: world=(${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}) quat=(${quat.x.toFixed(4)}, ${quat.y.toFixed(4)}, ${quat.z.toFixed(4)}, ${quat.w.toFixed(4)})`);
  }

  // 判断自然姿势
  const leftHand = skeleton.bones.find(b => b.name === 'LeftWrist' || b.name === 'LeftHand');
  const rightHand = skeleton.bones.find(b => b.name === 'RightWrist' || b.name === 'RightHand');
  if (leftHand) {
    const pos = getWorldPosition(leftHand);
    console.log(`  Left hand world Y=${pos.y.toFixed(4)} (low Y = arms down), Z=${pos.z.toFixed(4)} (low Z = close to body)`);
  }
  if (rightHand) {
    const pos = getWorldPosition(rightHand);
    console.log(`  Right hand world Y=${pos.y.toFixed(4)}, Z=${pos.z.toFixed(4)}`);
  }

  return result;
}

async function main() {
  const fixedPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed.glb');
  const originalPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');

  const fixed = await analyzeModel('FIXED vroid-fixed.glb', fixedPath);
  const original = await analyzeModel('ORIGINAL vroid.glb', originalPath);

  if (fixed && original) {
    console.log('\n\n=== COMPARISON (fixed - original) ===');
    const armBones = [
      'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftWrist',
      'RightShoulder', 'RightArm', 'RightForeArm', 'RightWrist'
    ];
    for (const boneName of armBones) {
      const f = fixed[boneName];
      const o = original[boneName];
      if (!f || !o) continue;
      console.log(`${boneName}: dY=${(f.y - o.y).toFixed(4)}, dZ=${(f.z - o.z).toFixed(4)}`);
    }
  }
}

main().catch(console.error);
