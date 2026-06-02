/**
 * 修复 VRoid 模型手臂姿势 — v2。
 * 策略：直接 SET 骨骼旋转到目标欧拉角，而不是在原有基础上叠加。
 * 
 * 目标姿势（手臂自然下垂）：
 * - LeftShoulder:  X≈0°, Y≈0°, Z≈0°（无旋转，手臂在身体旁边）
 * - LeftArm:      X≈-90°, Y≈0°, Z≈0°（大臂向下指）
 * - LeftForeArm:  X≈0°, Y≈-20°, Z≈0°（小臂略向前弯）
 * - RightShoulder: X≈0°, Y≈0°, Z≈0°（镜像）
 * - RightArm:     X≈-90°, Y≈0°, Z≈0°（镜像）
 * - RightForeArm: X≈0°, Y≈20°, Z≈0°（镜像）
 *
 * 注意：欧拉角 → 四元数 有歧义，我们用 Three.js 兼容的约定。
 * Three.js 的 Euler(order='XYZ') → Quaternion 的转换。
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');
const outputPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed-v2.glb');

// Three.js 欧拉角 → 四元数的转换（order='XYZ'）
// 参考 THREE.Euler.prototype._quaternionFromEuler
function eulerToQuat(ex, ey, ez, order = 'XYZ') {
  const c1 = Math.cos(ex / 2), s1 = Math.sin(ex / 2);
  const c2 = Math.cos(ey / 2), s2 = Math.sin(ey / 2);
  const c3 = Math.cos(ez / 2), s3 = Math.sin(ez / 2);

  let x, y, z, w;
  if (order === 'XYZ') {
    x = s1 * c2 * c3 + c1 * s2 * s3;
    y = c1 * s2 * c3 - s1 * c2 * s3;
    z = c1 * c2 * s3 - s1 * s2 * c3;
    w = c1 * c2 * c3 + s1 * s2 * s3;
  } else {
    // 默认 XYZ
    x = s1 * c2 * c3 + c1 * s2 * s3;
    y = c1 * s2 * c3 - s1 * c2 * s3;
    z = c1 * c2 * s3 - s1 * s2 * c3;
    w = c1 * c2 * c3 + s1 * s2 * s3;
  }
  return [x, y, z, w];
}

function quatMultiply(q1, q2) {
  const [x1, y1, z1, w1] = q1;
  const [x2, y2, z2, w2] = q2;
  return [
    w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
    w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
    w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
    w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
  ];
}

function quatInverse(q) {
  const [x, y, z, w] = q;
  const len2 = x * x + y * y + z * z + w * w;
  return [-x / len2, -y / len2, -z / len2, w / len2];
}

function parseGLB(path) {
  const buffer = readFileSync(path);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const magic = dataView.getUint32(0, true);
  if (magic !== 0x46546C67) throw new Error(`Invalid GLB: ${path}`);
  const jsonChunkLength = dataView.getUint32(12, true);
  const jsonBytes = buffer.slice(20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonBytes.toString('utf-8'));
  const binChunkLength = dataView.getUint32(20 + jsonChunkLength, true);
  const binData = buffer.slice(20 + jsonChunkLength + 8, 20 + jsonChunkLength + 8 + binChunkLength);
  return { gltf, binData, buffer };
}

function writeGLB(gltf, binData, outputPath) {
  const newJsonStr = JSON.stringify(gltf);
  const newJsonBuffer = Buffer.from(newJsonStr, 'utf-8');
  const padding = (4 - (newJsonBuffer.length % 4)) % 4;
  const paddedJson = Buffer.concat([newJsonBuffer, Buffer.alloc(padding, 0x20)]);
  const newTotalLength = 20 + paddedJson.length + 8 + binData.length;
  const outputBuffer = Buffer.alloc(newTotalLength);
  const outputView = new DataView(outputBuffer.buffer, outputBuffer.byteOffset, outputBuffer.byteLength);
  outputView.setUint32(0, 0x46546C67, true);
  outputView.setUint32(4, 2, true);
  outputView.setUint32(8, newTotalLength, true);
  outputView.setUint32(12, paddedJson.length, true);
  outputView.setUint32(16, 0x4E4F534A, true);
  paddedJson.copy(outputBuffer, 20);
  const binChunkOffset = 20 + paddedJson.length;
  outputView.setUint32(binChunkOffset, binData.length, true);
  outputView.setUint32(binChunkOffset + 4, 0x004E4942, true);
  binData.copy(outputBuffer, binChunkOffset + 8);
  writeFileSync(outputPath, outputBuffer);
}

// 目标姿势（欧拉角，单位弧度）
// 经过计算，当前 -90° 不够，尝试 -130°（约 -2.27 rad）
const TARGET_POSES = {
  LeftShoulder:  { ex: 0, ey: 0.3, ez: 0 },        // 肩膀略向前，让手臂离开身体
  LeftArm:       { ex: -2.3, ey: 0, ez: 0 },        // -130° 大臂向下
  LeftForeArm:   { ex: 0, ey: -0.5, ez: 0 },        // -29° 小臂略向前弯
  RightShoulder: { ex: 0, ey: -0.3, ez: 0 },       // 肩膀略向前（镜像）
  RightArm:      { ex: -2.3, ey: 0, ez: 0 },        // -130° 大臂向下
  RightForeArm:  { ex: 0, ey: 0.5, ez: 0 },         // +29° 小臂略向前弯（镜像）
};

function main() {
  const { gltf, binData } = parseGLB(modelPath);
  console.log(`Loaded: ${gltf.nodes?.length} nodes`);

  // 先打印原始旋转
  console.log('\n=== Original rotations ===');
  for (const [name, target] of Object.entries(TARGET_POSES)) {
    const node = gltf.nodes?.find(n => n.name === name);
    if (!node) { console.log(`${name}: NOT FOUND`); continue; }
    console.log(`${name}: rotation=[${node.rotation?.map(v => v.toFixed(4)).join(',')}], target Euler=(${(target.ex*180/Math.PI).toFixed(0)}°, ${(target.ey*180/Math.PI).toFixed(0)}°, ${(target.ez*180/Math.PI).toFixed(0)}°)`);
  }

  // 修改旋转：直接设置为目标四元数
  console.log('\n=== Applying target rotations ===');
  for (const [name, target] of Object.entries(TARGET_POSES)) {
    const node = gltf.nodes?.find(n => n.name === name);
    if (!node) continue;
    const targetQuat = eulerToQuat(target.ex, target.ey, target.ez, 'XYZ');
    console.log(`${name}: new quat=[${targetQuat.map(v => v.toFixed(6)).join(', ')}]`);
    node.rotation = targetQuat.map(v => Number(v.toFixed(10)));
  }

  // 写回
  writeGLB(gltf, binData, outputPath);
  console.log(`\n✅ Written to: ${outputPath}`);
}

main();
