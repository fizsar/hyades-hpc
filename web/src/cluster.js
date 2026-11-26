// SPDX-License-Identifier: AGPL-3.0-only
// The Hyades drawn with the real J2000 positions of their main stars (flat
// projection, east to the left, north up). Each star is a node of the cluster;
// circuit-style traces (a straight run, then a 45° bend) join them.
import { t } from './i18n.js'

const NS = 'http://www.w3.org/2000/svg'
const W = 900, H = 800

// RA (h, m, s), Dec (°, ′, ″), V magnitude. Source: Wikipedia infoboxes.
const STARS = [
  { id: 'epsilon', node: 'login',      d: 'ε Tau', ra: [4, 28, 37.0003],  de: [19, 10, 49.563],  mag: 3.53, lab: [16, 4, 'start'] },
  { id: 'delta1',  node: 'control',    d: 'δ¹ Tau', ra: [4, 22, 56.09253], de: [17, 32, 33.0487], mag: 3.77, lab: [16, 4, 'start'] },
  { id: 'gamma',   node: 'mariadb',    d: 'γ Tau', ra: [4, 19, 47.6037],  de: [15, 37, 39.512],  mag: 3.65, lab: [-16, 4, 'end'] },
  { id: 't71',     node: 'compute1',   d: '71 Tau', ra: [4, 26, 20.77082], de: [15, 37, 5.8841],  mag: 4.48, lab: [0, 30, 'middle'] },
  { id: 'theta1',  node: 'compute2',   d: 'θ¹ Tau', ra: [4, 28, 34.49209], de: [15, 57, 44.2832], mag: 3.84, lab: [-16, -12, 'end'] },
  { id: 'theta2',  node: 'monitoring', d: 'θ² Tau', ra: [4, 28, 39.74455], de: [15, 52, 15.1226], mag: 3.40, lab: [18, 8, 'start'] },
  { id: 't80',     node: 'compute3',   d: '80 Tau', ra: [4, 30, 8.53],     de: [15, 38, 16.4],    mag: 5.58, lab: [0, 30, 'middle'] },
]
const ALDEBARAN = { ra: [4, 35, 55.23907], de: [16, 30, 33.4885], mag: 0.85 } // foreground, not a member

const EDGES = [ // [from, to, dashed (metrics, not jobs)]
  ['epsilon', 'delta1'], ['delta1', 'gamma'], ['delta1', 't71'], ['delta1', 'theta1'], ['delta1', 't80'],
  ['theta2', 'theta1', true], ['theta2', 't80', true], ['theta2', 't71', true],
]

const raDeg = ([h, m, s]) => 15 * (h + m / 60 + s / 3600)
const deDeg = ([d, m, s]) => d + m / 60 + s / 3600

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}

// straight run along the longer axis, then a 45° bend
function trace(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, ax = Math.abs(dx), ay = Math.abs(dy)
  const pts = [[a.x, a.y]]
  if (ax >= ay) pts.push([a.x + Math.sign(dx) * (ax - ay), a.y])
  else pts.push([a.x, a.y + Math.sign(dy) * (ay - ax)])
  pts.push([b.x, b.y])
  return 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')
}

export function initCluster(svg, tip, onPick, reduced) {
  const all = [...STARS, { ...ALDEBARAN, id: 'aldebaran' }]
  const ras = all.map((s) => raDeg(s.ra)), des = all.map((s) => deDeg(s.de))
  const ra0 = (Math.min(...ras) + Math.max(...ras)) / 2, de0 = (Math.min(...des) + Math.max(...des)) / 2
  const cosd = Math.cos((de0 * Math.PI) / 180)
  const spanX = (Math.max(...ras) - Math.min(...ras)) * cosd, spanY = Math.max(...des) - Math.min(...des)
  const k = Math.min((W - 250) / spanX, (H - 210) / spanY)
  const pos = (s) => ({ x: W / 2 - (raDeg(s.ra) - ra0) * cosd * k, y: H / 2 - (deDeg(s.de) - de0) * k })
  const at = {}
  for (const s of all) at[s.id] = pos(s)

  const defs = el('defs', {}, svg)
  const g = el('radialGradient', { id: 'halo' }, defs)
  el('stop', { offset: '0', 'stop-color': '#9be7ff', 'stop-opacity': '.55' }, g)
  el('stop', { offset: '.35', 'stop-color': '#5ac8fa', 'stop-opacity': '.16' }, g)
  el('stop', { offset: '1', 'stop-color': '#5ac8fa', 'stop-opacity': '0' }, g)

  // traces
  const wires = el('g', { class: 'wires' }, svg)
  for (const [a, b, dashed] of EDGES) {
    const d = trace(at[a], at[b])
    el('path', { d, class: dashed ? 'wire dash' : 'wire' }, wires)
    if (!reduced) el('path', { d, class: dashed ? 'pulse dash' : 'pulse', pathLength: '100' }, wires)
  }

  // Aldebaran: bright, but not part of the cluster
  const A = at.aldebaran
  const ag = el('g', { class: 'ald' }, svg)
  el('circle', { cx: A.x, cy: A.y, r: 30, fill: 'url(#halo)' }, ag)
  el('circle', { cx: A.x, cy: A.y, r: 5.5, class: 'core ald-core' }, ag)
  const at1 = el('text', { x: A.x, y: A.y + 28, 'text-anchor': 'middle', class: 'lab-d' }, ag)
  at1.textContent = 'α Tau · Aldebaran'
  const at2 = el('text', { x: A.x, y: A.y + 43, 'text-anchor': 'middle', class: 'lab-d ald-note' }, ag)
  at2.dataset.i18n = 'cluster.ald'

  // member stars = nodes
  const nodes = {}
  STARS.forEach((s, i) => {
    const p = at[s.id], r = 2.6 + (5.8 - s.mag) * 1.05
    const gr = el('g', { class: 'node-star', tabindex: '0', role: 'link', 'data-node': s.node }, svg)
    gr.style.setProperty('--i', String(i))
    el('circle', { cx: p.x, cy: p.y, r: r * 5, fill: 'url(#halo)' }, gr)
    el('circle', { cx: p.x, cy: p.y, r: r + 7, class: 'ring' }, gr)
    el('circle', { cx: p.x, cy: p.y, r, class: 'core' }, gr)
    el('circle', { cx: p.x, cy: p.y, r: r + 16, class: 'hit' }, gr)
    const [dx, dy, anchor] = s.lab
    const l1 = el('text', { x: p.x + dx, y: p.y + dy, 'text-anchor': anchor, class: 'lab-n' }, gr)
    l1.textContent = s.node
    const l2 = el('text', { x: p.x + dx, y: p.y + dy + 14, 'text-anchor': anchor, class: 'lab-d' }, gr)
    l2.textContent = s.d
    nodes[s.node] = { gr, p, r }
    const show = () => {
      const box = svg.getBoundingClientRect(), host = svg.parentElement.getBoundingClientRect()
      tip.hidden = false
      tip.replaceChildren()
      const b = document.createElement('strong'); b.textContent = t(`n.${s.node}.t`)
      const sm = document.createElement('span'); sm.textContent = t('tip.hint')
      tip.append(b, sm)
      tip.style.left = `${box.left - host.left + (p.x / W) * box.width}px`
      tip.style.top = `${box.top - host.top + (p.y / H) * box.height - r - 16}px`
    }
    gr.addEventListener('mouseenter', show)
    gr.addEventListener('focus', show)
    gr.addEventListener('mouseleave', () => { tip.hidden = true })
    gr.addEventListener('blur', () => { tip.hidden = true })
    gr.addEventListener('click', () => onPick(s.node))
    gr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.node) } })
    gr.setAttribute('aria-label', `${s.node} (${s.d})`)
  })
  return nodes
}
