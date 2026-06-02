/**
 * 验证 vroid-fixed.glb 中手臂骨骼的旋转值是否正确修改。
 * 同时读取原始 vroid.glb 进行对比。
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const originalPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');
const fixedPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed.glb');

function parseGLB(path) {
  const buffer = readFileSync(path);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  const magic = dataView.getUint32(0, true);
  if (magic !== 0x46546C67) throw new Error(`Invalid GLB: ${path}`);
  
  const jsonChunkLength = dataView.getUint32(12, true);
  const jsonBytes = buffer.slice(20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonBytes.toString('utf-8'));
  
  return { gltf, buffer, dataView };
}

function quatToEuler(q) {
  // q = [x, y, z, w]
  const [x, y, z, w] = q;
  // Roll (X-axis rotation)
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);
  // Pitch (Y-axis rotation)
  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.copySign(Math.PI / 2, sinp) : Math.asin(sinp);
  // Yaw (Z-axis rotation)
  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);
  return { roll: roll * 180 / Math.PI, pitch: pitch * 180 / Math.PI, yaw: yaw * 180 / Math.PI };
}

function inspectBones(gltf, label) {
  console.log(`\n=== ${label} ===`);
  const TARGET = ['LeftShoulder', 'LeftArm', 'RightShoulder', 'RightArm'];
  for (const node of gltf.nodes || []) {
    if (TARGET.includes(node.name)) {
      const idx = gltf.nodes.indexOf(node);
      console.log(`\n[${idx}] ${node.name}:`);
      if (node.rotation) {
        const euler = quatToEuler(node.rotation);
        console.log(`  rotation (quat): [${node.rotation.map(v => v.toFixed(6)).join(', ')}]`);
        console.log(`  rotation (euler deg): roll(X)=${euler.roll.toFixed(1)}, pitch(Y)=${euler.pitch.toFixed(1)}, yaw(Z)=${euler.yaw.toFixed(1)}`);
      } else {
        console.log(`  rotation: (none)`);
      }
      if (node.translation) console.log(`  translation: [${node.translation.map(v => v.toFixed(6)).join(', ')}]`);
      if (node.scale) console.log(`  scale: [${node.scale.map(v => v.toFixed(6)).join(', ')}]`);
    }
  }
}

// 解析两个文件
const original = parseGLB(originalPath);
const fixed = parseGLB(fixedPath);

console.log('Original file size:', original.buffer.length);
console.log('Fixed file size:', fixed.buffer.length);

inspectBones(original.gltf, 'ORIGINAL vroid.glb');
inspectBones(fixed.gltf, 'FIXED vroid-fixed.glb');

// 计算差异
console.log('\n\n=== 差异对比 (fixed - original) ===');
const TARGET = ['LeftShoulder', 'LeftArm', 'RightShoulder', 'RightArm'];
for (const boneName of TARGET) {
  const origNode = original.gltf.nodes.find(n => n.name === boneName);
  const fixedNode = fixed.gltf.nodes.find(n => n.name === boneName);
  if (!origNode || !fixedNode) {
    console.log(`${boneName}: MISSING in one file`);
    continue;
  }
  if (!origNode.rotation || !fixedNode.rotation) {
    console.log(`${boneName}: no rotation data`);
    continue;
  }
  const diff = fixedNode.rotation.map((v, i) => v - origNode.rotation[i]);
  const origEuler = quatToEuler(origNode.rotation);
  const fixedEuler = quatToEuler(fixedNode.rotation);
  console.log(`${boneName}:`);
  console.log(`  original euler: X=${origEuler.roll.toFixed(1)}° Y=${origEuler.pitch.toFixed(1)}° Z=${origEuler.yaw.toFixed(1)}°`);
  console.log(`  fixed euler:    X=${fixedEuler.roll.toFixed(1)}° Y=${fixedEuler.pitch.toFixed(1)}° Z=${fixedEuler.yaw.toFixed(1)}°`);
  console.log(`  delta euler:    X=${(fixedEuler.roll - origEuler.roll).toFixed(1)}° Y=${(fixedEuler.pitch - origEuler.pitch).toFixed(1)}° Z=${(fixedEuler.yaw - origEuler.yaw).toFixed(1)}°`);
}
