// SPDX-License-Identifier: AGPL-3.0-only
// Interactive architecture diagram. Nodes react to hover, focus and tap; the
// chips below do the same, so it also works on small screens and by keyboard.
import { t } from './i18n.js'

const NS = 'http://www.w3.org/2000/svg'
const el = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}

// id, x, y, w, h, title, sub
const BOXES = [
  ['login', 130, 60, 140, 76, 'login', 'sshd · munge'],
  ['control', 340, 60, 230, 76, 'control', 'slurmctld · slurmdbd'],
  ['mariadb', 650, 60, 150, 76, 'mariadb', 'slurm_acct_db'],
  ['compute1', 110, 250, 150, 76, 'compute1', 'slurmd · Apptainer'],
  ['compute2', 290, 250, 150, 76, 'compute2', 'slurmd · Apptainer'],
  ['compute3', 470, 250, 150, 76, 'compute3', 'slurmd · Apptainer'],
  ['monitoring', 690, 250, 170, 76, 'monitoring', 'Prometheus · Grafana'],
  ['home', 80, 420, 740, 56, '/home', ''],
]
const ORDER = ['login', 'control', 'mariadb', 'compute1', 'compute2', 'compute3', 'monitoring', 'home']

const bodyKey = (id) => (id.startsWith('compute') ? 'n.compute.b' : `n.${id}.b`)

let active = null
const nodeEls = {}, chipEls = {}
let infoEl = null

function show(id) {
  active = id
  for (const k of ORDER) {
    nodeEls[k].classList.toggle('active', k === id)
    chipEls[k].setAttribute('aria-pressed', String(k === id))
  }
  renderInfo()
}

export function renderInfo() {
  infoEl.replaceChildren()
  const h = document.createElement('strong')
  const p = document.createElement('p')
  if (active) { h.textContent = t(`n.${active}.t`); p.textContent = t(bodyKey(active)) }
  else { h.textContent = t('arch.default.t'); p.textContent = t('arch.default.b') }
  infoEl.append(h, p)
}

export function initArch(wrap, chips, info) {
  infoEl = info
  const svg = el('svg', { viewBox: '0 0 900 540', role: 'group', 'aria-label': 'Hyades architecture' }, wrap)
  svg.classList.add('arch')

  // wires (drawn first, under the boxes)
  const w = el('g', { class: 'awires' }, svg)
  const wire = (d, cls = '') => el('path', { d, class: `awire ${cls}` }, w)
  wire('M104 98 H130')                       // users → login
  wire('M270 98 H340')                       // login → control
  wire('M570 98 H650')                       // control → mariadb
  wire('M455 136 V193 H185 V250')            // control → compute1
  wire('M455 193 H365 V250')                 // … compute2
  wire('M455 193 H545 V250')                 // … compute3
  wire('M775 250 V176 H455 V136', 'dash')    // monitoring scrapes control
  wire('M690 288 H620', 'dash')              // monitoring scrapes compute3
  wire('M185 326 V420', 'dot'); wire('M365 326 V420', 'dot'); wire('M545 326 V420', 'dot') // /home
  wire('M130 128 H92 V420', 'dot')           // login mounts /home too

  // users
  el('ellipse', { cx: 60, cy: 98, rx: 44, ry: 24, class: 'user' }, svg)
  const u = el('text', { x: 60, y: 102, 'text-anchor': 'middle', class: 'a-sub' }, svg)
  u.textContent = 'alice · bob'

  for (const [id, x, y, wd, ht, title, sub] of BOXES) {
    const g = el('g', { class: `anode ${id === 'home' ? 'home' : ''}`, tabindex: '0', role: 'button', 'data-node': id }, svg)
    el('rect', { x, y, width: wd, height: ht, rx: 12 }, g)
    const cx = x + wd / 2
    if (id === 'home') {
      const a = el('text', { x: cx, y: y + 24, 'text-anchor': 'middle', class: 'a-title' }, g); a.textContent = title
      const b = el('text', { x: cx, y: y + 43, 'text-anchor': 'middle', class: 'a-sub', 'data-i18n': 'arch.home' }, g)
      b.textContent = t('arch.home')
    } else {
      const a = el('text', { x: cx, y: y + 32, 'text-anchor': 'middle', class: 'a-title' }, g); a.textContent = title
      const b = el('text', { x: cx, y: y + 54, 'text-anchor': 'middle', class: 'a-sub' }, g); b.textContent = sub
    }
    nodeEls[id] = g
    g.addEventListener('mouseenter', () => show(id))
    g.addEventListener('focus', () => show(id))
    g.addEventListener('click', () => show(id))
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(id) } })
    g.setAttribute('aria-label', title)
  }

  const leg = el('text', { x: 80, y: 516, class: 'a-leg' }, svg)
  leg.dataset.i18n = 'arch.munge'
  leg.textContent = t('arch.munge')

  for (const id of ORDER) {
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'chip'; b.textContent = id === 'home' ? '/home' : id
    b.setAttribute('aria-pressed', 'false')
    b.addEventListener('click', () => show(id))
    chips.appendChild(b); chipEls[id] = b
  }
  renderInfo()
  return { select: show }
}
