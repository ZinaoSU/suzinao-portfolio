/**
 * 修复 VRoid 模型手臂姿势 — v3。
 * 目标姿势：两手自然放在大腿前侧（类似休息站立姿势）。
 * 
 * 实现策略：
 * 1. 用 Three.js 的骨骼系统计算"最终手部位置"
 * 2. 反向推导应该设置的骨骼旋转角度
 * 3. 直接设置骨骼旋转四元数
 *
 * 方法：暴力搜索（grid search）找出最合适的骨骼旋转角度，
 * 使得手部世界坐标 ≈ 目标位置（Y≈0.95, Z≈0.15）
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- GLB 解析 ---
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
  return { gltf, binData };
}

// --- 矩阵工具 ---
function quatToMatrix(q) {
  const [x, y, z, w] = q;
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

function matMul(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      r[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
  return r;
}

function trsMatrix(t, r, s) {
  const m = quatToMatrix(r || [0, 0, 0, 1]);
  const sc = [s?.[0] ?? 1, s?.[1] ?? 1, s?.[2] ?? 1];
  return [
    m[0] * sc[0], m[1] * sc[1], m[2] * sc[2], 0,
    m[4] * sc[0], m[5] * sc[1], m[6] * sc[2], 0,
    m[8] * sc[0], m[9] * sc[1], m[10] * sc[2], 0,
    t?.[0] ?? 0, t?.[1] ?? 0, t?.[2] ?? 0, 1
  ];
}

// --- 欧拉角 → 四元数 (XYZ order) ---
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
    x = s1 * c2 * c3 + c1 * s2 * s3;
    y = c1 * s2 * c3 - s1 * c2 * s3;
    z = c1 * c2 * s3 - s1 * s2 * c3;
    w = c1 * c2 * c3 + s1 * s2 * s3;
  }
  return [x, y, z, w];
}

// --- 计算手部世界坐标（给定骨骼旋转覆盖）---
function computeHandPositions(gltf, boneOverrides) {
  const nodes = gltf.nodes || [];
  // 复制节点旋转（应用覆盖）
  const rotations = nodes.map(n => n.rotation ? [...n.rotation] : null);
  for (const [name, quat] of Object.entries(boneOverrides)) {
    const idx = nodes.findIndex(n => n.name === name);
    if (idx !== -1) rotations[idx] = [...quat];
  }

  // 计算世界矩阵
  const wm = new Array(nodes.length);
  const isChild = new Set();
  nodes.forEach(n => n.children?.forEach(c => isChild.add(c)));
  const roots = nodes.map((_, i) => i).filter(i => !isChild.has(i));
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  function compute(i, pm) {
    const n = nodes[i];
    const m = trsMatrix(n.translation, rotations[i], n.scale);
    wm[i] = matMul(pm, m);
    n.children?.forEach(c => compute(c, wm[i]));
  }
  roots.forEach(r => compute(r, identity));

  // 返回左手/右手世界坐标
  const result = {};
  for (const side of ['Left', 'Right']) {
    for (const name of [`${side}Hand`, `${side}Wrist`]) {
      const idx = nodes.findIndex(n => n.name === name);
      if (idx !== -1) {
        result[side] = { x: wm[idx][12], y: wm[idx][13], z: wm[idx][14] };
        break;
      }
    }
  }
  return result;
}

// --- 网格搜索最佳角度 ---
function gridSearch(gltf) {
  // 搜索范围（弧度）：
  // LeftShoulder Y: -0.5 ~ 0.5 (控制手臂前后)
  // LeftArm X: -2.5 ~ -0.5 (控制手臂上下)
  // LeftForeArm Y: -0.8 ~ 0.0 (控制小臂弯曲)
  // （右手镜像）
  const step = 0.15; // ~8.6° 步长
  let bestScore = Infinity;
  let bestParams = null;
  let iterations = 0;

  const targetLeftY = 0.95;  // 大腿中部高度
  const targetLeftZ = 0.12;  // 身体前方约 12cm
  const targetRightY = 0.95;
  const targetRightZ = 0.12;

  for (let sy = -0.3; sy <= 0.5; sy += step) {      // LeftShoulder Y
    for (let ax = -2.5; ax <= -0.3; ax += step) {    // LeftArm X
      for (let fy = -0.6; fy <= 0.1; fy += step) {  // LeftForeArm Y
        // 右手是镜像（符号相反）
        const overrides = {
          LeftShoulder: eulerToQuat(0, sy, 0),
          LeftArm: eulerToQuat(ax, 0, 0),
          LeftForeArm: eulerToQuat(0, fy, 0),
          RightShoulder: eulerToQuat(0, -sy, 0),  // 镜像
          RightArm: eulerToQuat(ax, 0, 0),        // 镜像
          RightForeArm: eulerToQuat(0, -fy, 0),   // 镜像
        };

        const pos = computeHandPositions(gltf, overrides);
        if (!pos.Left || !pos.Right) continue;

        // 评分：距离目标位置越近越好
        const dLeftY = pos.Left.y - targetLeftY;
        const dLeftZ = pos.Left.z - targetLeftZ;
        const dRightY = pos.Right.y - targetRightY;
        const dRightZ = pos.Right.z - targetRightZ;
        const score = dLeftY * dLeftY + dLeftZ * dLeftZ + dRightY * dRightY + dRightZ * dRightZ;

        iterations++;
        if (score < bestScore) {
          bestScore = score;
          bestParams = { sy, ax, fy, pos, overrides };
        }
      }
    }
  }

  console.log(`Grid search: ${iterations} iterations, best score: ${bestScore.toFixed(6)}`);
  return bestParams;
}

// --- 主逻辑 ---
function main() {
  const modelPath = join(__dirname, '..', 'public', 'models', 'vroid.glb');
  const outputPath = join(__dirname, '..', 'public', 'models', 'vroid-fixed.glb');
  
  const { gltf, binData } = parseGLB(modelPath);
  console.log(`Loaded: ${gltf.nodes?.length} nodes`);

  // 网格搜索最佳角度
  const best = gridSearch(gltf);
  if (!best) { console.error('No solution found'); process.exit(1); }

  console.log(`\nBest params: LeftShoulder Y=${best.sy.toFixed(3)} (${(best.sy*180/Math.PI).toFixed(1)}°), LeftArm X=${best.ax.toFixed(3)} (${(best.ax*180/Math.PI).toFixed(1)}°), LeftForeArm Y=${best.fy.toFixed(3)} (${(best.fy*180/Math.PI).toFixed(1)}°)`);
  console.log(`Hand positions: Left(Y=${best.pos.Left.y.toFixed(4)}, Z=${best.pos.Left.z.toFixed(4)}), Right(Y=${best.pos.Right.y.toFixed(4)}, Z=${best.pos.Right.z.toFixed(4)})`);

  // 应用最佳旋转到 GLTF
  for (const [name, quat] of Object.entries(best.overrides)) {
    const node = gltf.nodes?.find(n => n.name === name);
    if (!node) { console.log(`Warning: ${name} not found`); continue; }
    node.rotation = quat.map(v => Number(v.toFixed(10)));
    console.log(`  ${name}: rotation=[${quat.map(v => v.toFixed(6)).join(', ')}]`);
  }

  // 写回 GLB
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
  console.log(`\n✅ Written to: ${outputPath}`);
  console.log(`   Size: ${newTotalLength} bytes`);
}

main();
