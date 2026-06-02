/**
 * 修改 VRoid GLB 模型的手臂骨骼旋转，将 A-pose 改为自然下垂姿势。
 * 
 * 原理：直接解析 GLB 二进制格式，修改手臂骨骼节点的四元数旋转值。
 * GLB 结构: [12-byte header] [JSON chunk] [BIN chunk]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');
const outputPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed.glb');

const buffer = readFileSync(modelPath);
const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

// === 解析 GLB header ===
const magic = dataView.getUint32(0, true);
if (magic !== 0x46546C67) {
  console.error('Not a valid GLB file (magic mismatch)');
  process.exit(1);
}
const version = dataView.getUint32(4, true);
const totalLength = dataView.getUint32(8, true);
console.log(`GLB v${version}, ${totalLength} bytes`);

// === 解析 JSON chunk ===
const jsonChunkLength = dataView.getUint32(12, true);
const jsonChunkType = dataView.getUint32(16, true);
console.log(`JSON chunk: ${jsonChunkLength} bytes, type=${jsonChunkType}`);

const jsonBytes = buffer.slice(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBytes.toString('utf-8'));
console.log(`Nodes: ${gltf.nodes?.length || 0}, Meshes: ${gltf.meshes?.length || 0}`);

// === 解析 BIN chunk ===
const binStart = 20 + jsonChunkLength;
if (binStart + 8 > totalLength) {
  console.error('No BIN chunk found');
  process.exit(1);
}
const binChunkLength = dataView.getUint32(binStart, true);
const binChunkType = dataView.getUint32(binStart + 4, true);
const binData = buffer.slice(binStart + 8, binStart + 8 + binChunkLength);
console.log(`BIN chunk: ${binChunkLength} bytes`);

// === 查找手臂骨骼节点 ===
const TARGET_BONES = ['LeftShoulder', 'LeftArm', 'RightShoulder', 'RightArm'];
const targetNodes = [];

for (const node of gltf.nodes || []) {
  if (TARGET_BONES.includes(node.name)) {
    targetNodes.push(node);
    console.log(`Found bone: ${node.name} (node index: ${gltf.nodes.indexOf(node)})`);
    console.log(`  rotation:`, node.rotation);
    console.log(`  translation:`, node.translation);
    console.log(`  scale:`, node.scale);
  }
}

if (targetNodes.length === 0) {
  console.error('No arm bones found!');
  process.exit(1);
}

// === 修改骨骼旋转 ===
// 四元数乘法: q_out = q_rot * q_in (局部空间旋转)
function multiplyQuaternions(q1, q2) {
  const [x1, y1, z1, w1] = q1;
  const [x2, y2, z2, w2] = q2;
  return [
    w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
    w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
    w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
    w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
  ];
}

// X 轴旋转四元数: [sin(angle/2), 0, 0, cos(angle/2)]
function makeRotationXQuat(angle) {
  return [Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)];
}

for (const node of targetNodes) {
  if (!node.rotation || !gltf.accessors) continue;
  
  const angle = node.name.includes('Shoulder') ? -1.5 : -1.0;
  const rotQuat = makeRotationXQuat(angle);
  const newRotation = multiplyQuaternions(rotQuat, node.rotation);
  
  console.log(`\n${node.name}:`);
  console.log(`  angle: ${angle.toFixed(3)} rad (${(angle * 180 / Math.PI).toFixed(1)}°)`);
  console.log(`  old quat: [${node.rotation.map(v => v.toFixed(4)).join(', ')}]`);
  console.log(`  new quat: [${newRotation.map(v => v.toFixed(4)).join(', ')}]`);
  
  // 更新节点旋转
  node.rotation = newRotation.map(v => Number(v.toFixed(10)));
}

// === 写回 GLB ===
// 1. 序列化修改后的 JSON
const newJsonStr = JSON.stringify(gltf);
const newJsonBuffer = Buffer.from(newJsonStr, 'utf-8');

// 2. 对齐到 4 字节
const padding = (4 - (newJsonBuffer.length % 4)) % 4;
const paddedJson = Buffer.concat([newJsonBuffer, Buffer.alloc(padding, 0x20)]);
const newJsonChunkLength = paddedJson.length;

// 3. 重建 GLB
const newTotalLength = 20 + newJsonChunkLength + 8 + binData.length;
const outputBuffer = Buffer.alloc(newTotalLength);
const outputView = new DataView(outputBuffer.buffer, outputBuffer.byteOffset, outputBuffer.byteLength);

// Header
outputView.setUint32(0, 0x46546C67, true);  // magic
outputView.setUint32(4, version, true);
outputView.setUint32(8, newTotalLength, true);

// JSON chunk
outputView.setUint32(12, newJsonChunkLength, true);
outputView.setUint32(16, 0x4E4F534A, true); // "JSON"
paddedJson.copy(outputBuffer, 20);

// BIN chunk
const binChunkOffset = 20 + newJsonChunkLength;
outputView.setUint32(binChunkOffset, binData.length, true);
outputView.setUint32(binChunkOffset + 4, 0x004E4942, true); // "BIN\0"
binData.copy(outputBuffer, binChunkOffset + 8);

writeFileSync(outputPath, outputBuffer);
console.log(`\n✅ Written to: ${outputPath}`);
console.log(`   Size: ${newTotalLength} bytes`);
