// SPDX-License-Identifier: AGPL-3.0-only
// The Hyades drawn with the real J2000 positions of their main stars (flat
// projection, east to the left, north up). Each star is a node of the cluster.
// γ Tauri, the vertex of the V, is the control node: every trace starts there.
// Green packets run along the traces in step with the animated terminal.
import { t } from './i18n.js'

const NS = 'http://www.w3.org/2000/svg'
const W = 900, H = 800

// RA (h, m, s), Dec (°, ′, ″), V magnitude. Source: Wikipedia infoboxes.
// lab = [dx, dy, anchor]: label offset from its star (the stars never move).
const STARS = [
  { id: 'gamma',   node: 'control',    d: 'γ Tau',  ra: [4, 19, 47.6037],  de: [15, 37, 39.512],  mag: 3.65, lab: [18, 5, 'start'] },
  { id: 'delta1',  node: 'login',      d: 'δ¹ Tau', ra: [4, 22, 56.09253], de: [17, 32, 33.0487], mag: 3.77, lab: [-18, 4, 'end'] },
  { id: 'epsilon', node: 'monitoring', d: 'ε Tau',  ra: [4, 28, 37.0003],  de: [19, 10, 49.563],  mag: 3.53, lab: [18, 4, 'start'] },
  { id: 't71',     node: 'mariadb',    d: '71 Tau', ra: [4, 26, 20.77082], de: [15, 37, 5.8841],  mag: 4.48, lab: [0, 32, 'middle'] },
  { id: 'theta2',  node: 'compute1',   d: 'θ² Tau', ra: [4, 28, 39.74455], de: [15, 52, 15.1226], mag: 3.40, lab: [0, 42, 'middle'] },
  { id: 'theta1',  node: 'compute2',   d: 'θ¹ Tau', ra: [4, 28, 34.49209], de: [15, 57, 44.2832], mag: 3.84, lab: [0, -36, 'middle'] },
  { id: 't80',     node: 'compute3',   d: '80 Tau', ra: [4, 30, 8.53],     de: [15, 38, 16.4],    mag: 5.58, lab: [-16, 4, 'end'] },
]
const ALDEBARAN = { ra: [4, 35, 55.23907], de: [16, 30, 33.4885], mag: 0.85 } // foreground, not a member

const raDeg = ([h, m, s]) => 15 * (h + m / 60 + s / 3600)
const deDeg = ([d, m, s]) => d + m / 60 + s / 3600

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}

const path = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')

// One trace per connection, all leaving γ. Circuit style: straight runs and 45° bends.
// The south arm shares a short trunk (a bus) and then each trace takes its own lane.
const ROUTES = {
  // north arm: two different ways out, so they never overlap
  login: (g, p) => { const m = g.x - p.x; return [[g.x, g.y], [g.x, p.y + m], [p.x, p.y]] },        // up, then 45° left
  monitoring: (g, p) => { const m = g.x - p.x; return [[g.x, g.y], [g.x - m, g.y - m], [p.x, p.y]] }, // 45° left, then up
  // south arm
  mariadb: (g, p) => [[g.x, g.y], [p.x, p.y]],
  compute1: (g, p) => { const h = g.y - p.y; return [[g.x, g.y], [g.x - 190, g.y], [g.x - 190 - h, p.y], [p.x, p.y]] },
  compute2: (g, p) => { const h = g.y - p.y; return [[g.x, g.y], [g.x - 130, g.y], [g.x - 130 - h, p.y], [p.x, p.y]] },
  compute3: (g, p) => { // 80 Tau sits behind 71 Tau on the same line: go round below it
    const L = Math.max(g.y, p.y) + 58
    return [[g.x, g.y], [g.x - 100, g.y], [g.x - 100 - (L - g.y), L], [p.x + (L - p.y), L], [p.x, p.y]]
  },
}
const DASHED = new Set(['monitoring']) // metrics, not jobs
const radius = (mag) => 2.6 + (5.8 - mag) * 1.05
// The V of the Hyades, as a constellation: north arm γ → δ¹ → ε, south arm γ → θ¹/θ² → Aldebaran.
// The last stretch (to Aldebaran, which is not a member) is dotted.

export function initCluster(svg, tip, onPick, reduced) {
  const all = [...STARS, { ...ALDEBARAN, id: 'aldebaran' }]
  const ras = all.map((s) => raDeg(s.ra)), des = all.map((s) => deDeg(s.de))
  const ra0 = (Math.min(...ras) + Math.max(...ras)) / 2, de0 = (Math.min(...des) + Math.max(...des)) / 2
  const cosd = Math.cos((de0 * Math.PI) / 180)
  const spanX = (Math.max(...ras) - Math.min(...ras)) * cosd, spanY = Math.max(...des) - Math.min(...des)
  const k = Math.min((W - 150) / spanX, (H - 150) / spanY) // a bit larger; relative positions unchanged
  const pos = (s) => ({ x: W / 2 - (raDeg(s.ra) - ra0) * cosd * k, y: H / 2 - (deDeg(s.de) - de0) * k })
  const at = {}
  for (const s of all) at[s.id] = pos(s)
  const gamma = at.gamma

  const defs = el('defs', {}, svg)
  const g = el('radialGradient', { id: 'halo' }, defs)
  el('stop', { offset: '0', 'stop-color': '#9be7ff', 'stop-opacity': '.55' }, g)
  el('stop', { offset: '.35', 'stop-color': '#5ac8fa', 'stop-opacity': '.16' }, g)
  el('stop', { offset: '1', 'stop-color': '#5ac8fa', 'stop-opacity': '0' }, g)

  // cluster network traces: their own, faint layer under the constellation
  const wires = el('g', { class: 'wires' }, svg)
  const wireOf = {}
  for (const s of STARS) {
    if (s.node === 'control') continue
    wireOf[s.node] = el('path', { d: path(ROUTES[s.node](gamma, at[s.id])), class: DASHED.has(s.node) ? 'wire dash' : 'wire' }, wires)
  }
  // constellation lines: thin, straight, with a gap before every star
  const gap = (a, b, ga, gb) => {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d
    return [[a.x + ux * ga, a.y + uy * ga], [b.x - ux * gb, b.y - uy * gb]]
  }
  const rg = (id) => radius(STARS.find((x) => x.id === id)?.mag ?? ALDEBARAN.mag) + 10
  const pair = { x: (at.theta1.x + at.theta2.x) / 2, y: (at.theta1.y + at.theta2.y) / 2 } // the double star θ¹/θ²
  const cons = el('g', { class: 'constellation' }, svg)
  for (const [a, b, ga, gb, dotted] of [
    [at.gamma, at.delta1, rg('gamma'), rg('delta1')],
    [at.delta1, at.epsilon, rg('delta1'), rg('epsilon')],
    [at.gamma, pair, rg('gamma'), 16],
    [pair, at.aldebaran, 16, 24, true],
  ]) {
    const [p, q] = gap(a, b, ga, gb)
    el('path', { d: path([p, q]), class: dotted ? 'cl dot' : 'cl' }, cons)
  }
  const packets = el('g', { class: 'packets' }, svg)

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
    const p = at[s.id], r = radius(s.mag)
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

  // A green packet along one trace. 'in' = towards control (a user submits a job),
  // 'out' = away from control (the job starts on a compute node).
  function sendPacket(node, dir) {
    const w = wireOf[node]
    if (!w) return
    const len = w.getTotalLength(), ms = Math.max(650, len * 2.1)
    const halo = el('circle', { r: 11, class: 'packet-halo' }, packets)
    const dot = el('circle', { r: 4.2, class: 'packet' }, packets)
    w.classList.add('live')
    const t0 = performance.now()
    const step = (now) => {
      const f = Math.min(1, (now - t0) / ms)
      const q = w.getPointAtLength((dir === 'in' ? 1 - f : f) * len)
      for (const c of [halo, dot]) { c.setAttribute('cx', q.x); c.setAttribute('cy', q.y) }
      if (f < 1) requestAnimationFrame(step)
      else { halo.remove(); dot.remove(); setTimeout(() => w.classList.remove('live'), 500) }
    }
    requestAnimationFrame(step)
  }
  if (!reduced) {
    window.addEventListener('hyades:flow', (e) => {
      const { node, dir, delay = 0 } = e.detail
      setTimeout(() => sendPacket(node, dir), delay)
    })
  }
  return nodes
}
