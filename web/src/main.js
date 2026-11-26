// SPDX-License-Identifier: AGPL-3.0-only
import './style.css'
import { initLang, setLang, getLang, dict } from './i18n.js'
import { startSky } from './sky.js'
import { initCluster } from './cluster.js'
import { initArch, renderInfo } from './arch.js'
import { initTerminal } from './terminal.js'

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = (id) => document.getElementById(id)

startSky($('sky'), reduced)

const arch = initArch($('arch-wrap'), $('arch-chips'), $('arch-info'))
initCluster($('cluster-svg'), $('cluster-tip'), (node) => {
  arch.select(node)
  $('arch').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}, reduced)
initTerminal($('term'), $('replay'), reduced)

function renderRows() {
  const learn = $('learn-body'), limits = $('limits-list')
  learn.replaceChildren(); limits.replaceChildren()
  for (const [piece, what] of dict[getLang()]['learn.rows']) {
    const tr = document.createElement('tr')
    const a = document.createElement('th'); a.scope = 'row'; a.textContent = piece
    const b = document.createElement('td'); b.textContent = what
    tr.append(a, b); learn.append(tr)
  }
  for (const [title, what] of dict[getLang()]['limits.rows']) {
    const li = document.createElement('li')
    const b = document.createElement('strong'); b.textContent = title + ' '
    li.append(b, what); limits.append(li)
  }
}

function applyLang(l) {
  setLang(l)
  renderRows()
  renderInfo()
}

applyLang(initLang())
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => applyLang(b.dataset.lang))
