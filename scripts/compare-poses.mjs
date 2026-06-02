/**
 * 对比 vroid-fixed-v2.glb 与原始 vroid.glb 的手部 Y 坐标。
 * 用法：node scripts/compare-poses.mjs
 */

import { readFileSync } from 'fs';
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
  const gltf = JSON.parse(buffer.slice(20, 20 + jsonChunkLength).toString('utf-8'));
  return gltf;
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

function trs(t, r, s) {
  const m = quatToMatrix(r || [0, 0, 0, 1]);
  const sc = [s?.[0] ?? 1, s?.[1] ?? 1, s?.[2] ?? 1];
  return [
    m[0] * sc[0], m[1] * sc[1], m[2] * sc[2], 0,
    m[4] * sc[0], m[5] * sc[1], m[6] * sc[2], 0,
    m[8] * sc[0], m[9] * sc[1], m[10] * sc[2], 0,
    t?.[0] ?? 0, t?.[1] ?? 0, t?.[2] ?? 0, 1
  ];
}

// --- 计算骨骼世界坐标 ---
function computeBonePositions(gltf) {
  const nodes = gltf.nodes || [];
  const wm = new Array(nodes.length);
  const isChild = new Set();
  nodes.forEach(n => n.children?.forEach(c => isChild.add(c)));
  const roots = nodes.map((_, i) => i).filter(i => !isChild.has(i));
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  function compute(i, pm) {
    const n = nodes[i];
    const m = trs(n.translation, n.rotation, n.scale);
    wm[i] = matMul(pm, m);
    n.children?.forEach(c => compute(c, wm[i]));
  }
  roots.forEach(r => compute(r, identity));
  return { wm, nodes };
}

// --- 主逻辑 ---
const models = [
  { label: 'ORIGINAL', path: join(__dirname, '..', 'public', 'models', 'vroid.glb') },
  { label: 'FIXED-V2', path: join(__dirname, '..', 'public', 'models', 'vroid-fixed-v2.glb') },
];

const results = {};
for (const m of models) {
  const gltf = parseGLB(m.path);
  const { wm, nodes } = computeBonePositions(gltf);
  results[m.label] = { wm, nodes };
  console.log(`\n=== ${m.label} ===`);
  const targets = ['LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand'];
  for (const name of targets) {
    const idx = nodes.findIndex(n => n.name === name);
    if (idx === -1) { console.log(`  ${name}: NOT FOUND`); continue; }
    const pos = [wm[idx][12], wm[idx][13], wm[idx][14]];
    console.log(`  ${name}: Y=${pos[1].toFixed(4)} Z=${pos[2].toFixed(4)}`);
  }
}

// 对比
console.log('\n\n=== COMPARISON (fixed - original) ===');
const targets = ['LeftHand', 'RightHand'];
for (const name of targets) {
  const o = results['ORIGINAL'];
  const f = results['FIXED-V2'];
  const oIdx = o.nodes.findIndex(n => n.name === name);
  const fIdx = f.nodes.findIndex(n => n.name === name);
  if (oIdx === -1 || fIdx === -1) { console.log(`${name}: missing`); continue; }
  const oY = o.wm[oIdx][13], fY = f.wm[fIdx][13];
  const oZ = o.wm[oIdx][14], fZ = f.wm[fIdx][14];
  console.log(`${name}: dY=${(fY - oY).toFixed(4)} dZ=${(fZ - oZ).toFixed(4)}`);
  console.log(`  original Y=${oY.toFixed(4)} → fixed Y=${fY.toFixed(4)}`);
}

// 结论
const oLeftHand = results['ORIGINAL'].wm[results['ORIGINAL'].nodes.findIndex(n => n.name === 'LeftHand')];
const fLeftHand = results['FIXED-V2'].wm[results['FIXED-V2'].nodes.findIndex(n => n.name === 'LeftHand')];
console.log('\n=== 结论 ===');
console.log(`LeftHand Y: ${oLeftHand[13].toFixed(4)} → ${fLeftHand[13].toFixed(4)} (Δ=${(fLeftHand[13] - oLeftHand[13]).toFixed(4)})`);
if (fLeftHand[13] < oLeftHand[13] - 0.3) {
  console.log('✅ 手臂明显下垂，应该看起来自然了！');
} else if (fLeftHand[13] < oLeftHand[13] - 0.1) {
  console.log('⚠️ 手臂有下垂但可能不够，需要进一步调整');
} else {
  console.log('❌ 手臂几乎没有下垂，姿势可能还是不对');
}
