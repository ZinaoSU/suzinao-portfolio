/**
 * 纯数学解析 GLB 文件，计算骨骼节点的世界坐标。
 * 不依赖浏览器 API，纯 Node.js 计算。
 *
 * GLB 格式：header(12) + JSON chunk + BIN chunk
 * 节点变换：translation + rotation(quat) + scale → 局部矩阵 → 世界矩阵
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// === 四元数 / 矩阵数学 ===

function quatToMatrix(quat) {
  // quat = [x, y, z, w]
  const [x, y, z, w] = quat;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  return [
    1 - (yy + zz), xy - wz, xz + wy, 0,
    xy + wz, 1 - (xx + zz), yz - wx, 0,
    xz - wy, yz + wx, 1 - (xx + yy), 0,
    0, 0, 0, 1
  ];
}

function mat4Multiply(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      r[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    }
  }
  return r;
}

function mat4FromTRS(translation, rotation, scale) {
  // T * R * S 矩阵
  const rm = quatToMatrix(rotation || [0, 0, 0, 1]);
  // 应用 scale
  const sm = [scale?.[0] ?? 1, scale?.[1] ?? 1, scale?.[2] ?? 1];
  const m = [
    rm[0] * sm[0], rm[1] * sm[1], rm[2] * sm[2], 0,
    rm[4] * sm[0], rm[5] * sm[1], rm[6] * sm[2], 0,
    rm[8] * sm[0], rm[9] * sm[1], rm[10] * sm[2], 0,
    translation?.[0] ?? 0, translation?.[1] ?? 0, translation?.[2] ?? 0, 1
  ];
  return m;
}

function mat4GetPosition(m) {
  return [m[12], m[13], m[14]];
}

function parseGLB(path) {
  const buffer = readFileSync(path);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const magic = dataView.getUint32(0, true);
  if (magic !== 0x46546C67) throw new Error(`Invalid GLB: ${path}`);
  const jsonChunkLength = dataView.getUint32(12, true);
  const jsonBytes = buffer.slice(20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonBytes.toString('utf-8'));

  return gltf;
}

function computeNodeWorldPositions(gltf) {
  const nodes = gltf.nodes || [];
  const worldMatrices = new Array(nodes.length);
  const worldPositions = new Array(nodes.length);

  function computeWorld(nodeIndex, parentWorldMatrix) {
    const node = nodes[nodeIndex];
    const localMat = mat4FromTRS(node.translation, node.rotation, node.scale);
    const worldMat = mat4Multiply(parentWorldMatrix, localMat);
    worldMatrices[nodeIndex] = worldMat;
    worldPositions[nodeIndex] = mat4GetPosition(worldMat);

    // 遍历子节点
    if (node.children) {
      for (const childIdx of node.children) {
        computeWorld(childIdx, worldMat);
      }
    }
  }

  // 找到根节点（parent 为 -1 或不在任何节点的 children 中）
  const isChild = new Set();
  for (const node of nodes) {
    if (node.children) {
      for (const c of node.children) isChild.add(c);
    }
  }
  const rootIndices = [];
  for (let i = 0; i < nodes.length; i++) {
    if (!isChild.has(i)) rootIndices.push(i);
  }

  const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  for (const rootIdx of rootIndices) {
    computeWorld(rootIdx, identity);
  }

  return { worldMatrices, worldPositions, nodes };
}

function analyzeModel(label, gltf) {
  console.log(`\n=== ${label} ===`);
  const { worldPositions, nodes } = computeNodeWorldPositions(gltf);

  const armBoneNames = [
    'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftWrist', 'LeftHand',
    'RightShoulder', 'RightArm', 'RightForeArm', 'RightWrist', 'RightHand'
  ];

  const result = {};
  for (const name of armBoneNames) {
    const idx = nodes.findIndex(n => n.name === name);
    if (idx === -1) {
      console.log(`${name}: NOT FOUND`);
      result[name] = null;
      continue;
    }
    const pos = worldPositions[idx];
    const node = nodes[idx];
    result[name] = { x: pos[0], y: pos[1], z: pos[2], node };
    console.log(`${name} [${idx}]: world=(${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}, ${pos[2].toFixed(4)})`);
    if (node.rotation) {
      console.log(`  rotation quat: [${node.rotation.map(v => v.toFixed(5)).join(', ')}]`);
    }
  }

  // 检查手的位置——Y 坐标越低说明手臂越下垂
  for (const handName of ['LeftWrist', 'LeftHand', 'RightWrist', 'RightHand']) {
    const idx = nodes.findIndex(n => n.name === handName);
    if (idx !== -1) {
      const pos = worldPositions[idx];
      console.log(`  ${handName}: Y=${pos[1].toFixed(4)} (low Y = arms down), Z=${pos[2].toFixed(4)} (Z < 0 = in front, Z > 0 = behind)`);
      break; // 只打印第一个找到的
    }
  }

  return result;
}

function main() {
  const fixedPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed.glb');
  const originalPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');

  const fixedGLTF = parseGLB(fixedPath);
  const originalGLTF = parseGLB(originalPath);

  const fixed = analyzeModel('FIXED vroid-fixed.glb', fixedGLTF);
  const original = analyzeModel('ORIGINAL vroid.glb', originalGLTF);

  // 对比关键骨骼的 Y 坐标变化（Y 下降 = 手臂下垂）
  console.log('\n\n=== 对比：手部 Y 坐标变化 (fixed - original) ===');
  for (const handName of ['LeftWrist', 'LeftHand', 'RightWrist', 'RightHand']) {
    const f = fixed[handName];
    const o = original[handName];
    if (f && o) {
      const dY = f.y - o.y;
      const dZ = f.z - o.z;
      console.log(`${handName}: dY=${dY.toFixed(4)} (negative = moved down), dZ=${dZ.toFixed(4)}`);
    }
  }

  // 判断：如果 fixed 的 hand Y 比 original 低，说明手臂下垂了（正确方向）
  const fHand = fixed['LeftWrist'] || fixed['LeftHand'];
  const oHand = original['LeftWrist'] || original['LeftHand'];
  if (fHand && oHand) {
    const dY = fHand.y - oHand.y;
    console.log(`\n=== 结论 ===`);
    if (dY < -0.05) {
      console.log(`✅ 左手 Y 坐标下降了 ${-dY.toFixed(4)}，手臂应该已经下垂！`);
    } else if (dY > 0.05) {
      console.log(`❌ 左手 Y 坐标上升了 ${dY.toFixed(4)}，手臂反而更向上了！`);
    } else {
      console.log(`⚠️  左手 Y 坐标变化很小 (${dY.toFixed(4)})，可能没有明显效果`);
    }
  }
}

main();
