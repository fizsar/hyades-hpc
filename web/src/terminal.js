// SPDX-License-Identifier: AGPL-3.0-only
// Replays the real output of `make demo` (src/demo.txt) as if it were typed
// live. prefers-reduced-motion: all the text at once, no autoplay.
import raw from './demo.txt?raw'

const LINES = raw.replace(/\s+$/, '').split('\n')
const TOKEN = /(\bCOMPLETED\b|\bPD\b|\bR\b|\(Resources\)|test_acc=[\d.]+|pi ~= [\d.]+)/g
const cls = (tok) => (tok === 'PD' || tok === '(Resources)' ? 'pd' : 'ok')

function lineNode(text) {
  const row = document.createElement('div')
  row.className = 'ln' + (text.startsWith('==') ? ' h' : '')
  if (text.startsWith('==')) { row.textContent = text; return row }
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) row.append(text.slice(last, m.index))
    const s = document.createElement('span'); s.className = cls(m[0]); s.textContent = m[0]; row.append(s)
    last = m.index + m[0].length
  }
  row.append(text.slice(last) || '​')
  return row
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Tell the cluster drawing what the terminal just showed, so the green packets match:
// jobs submitted → login to control; a job turns R on a node (or nodes) → control to them.
function flows(text) {
  const go = (node, dir, delay = 0) => window.dispatchEvent(new CustomEvent('hyades:flow', { detail: { node, dir, delay } }))
  if (text.startsWith('pi = trabajo')) { go('login', 'in'); go('login', 'in', 550) } // bob's and alice's sbatch
  const m = text.match(/\sR\s+\d+:\d+\s+\d+\s+(compute\d)/)                          // squeue row in state R
  if (m) go(m[1], 'out')
  if (text.startsWith('== salida de pi')) for (const n of [1, 2, 3]) go(`compute${n}`, 'out', (n - 1) * 160) // pi starts on all 3
}

export function initTerminal(pre, button, reduced) {
  let run = 0
  const cursor = document.createElement('span'); cursor.className = 'tcur'; cursor.textContent = '▌'

  function renderAll() {
    pre.replaceChildren()
    const p = document.createElement('div'); p.className = 'ln'
    p.innerHTML = '<span class="pr">$</span> make demo'
    pre.append(p, ...LINES.map(lineNode))
  }

  async function play() {
    const me = ++run
    if (reduced) { renderAll(); return }
    pre.replaceChildren()
    const prompt = document.createElement('div'); prompt.className = 'ln'
    const pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = '$ '
    const typed = document.createElement('span')
    prompt.append(pr, typed, cursor); pre.append(prompt)
    for (const ch of 'make demo') { await sleep(70 + Math.random() * 60); if (me !== run) return; typed.textContent += ch }
    await sleep(500); if (me !== run) return
    for (const text of LINES) {
      const row = lineNode(text)
      cursor.remove(); row.append(cursor); pre.append(row)
      pre.scrollTop = pre.scrollHeight
      flows(text)
      let d = 55
      if (text.startsWith('==')) d = 650
      else if (text.startsWith('epoch')) d = 1300
      else if (text.startsWith('host=')) d = 900
      else if (text === '') d = 350
      await sleep(d); if (me !== run) return
    }
    cursor.remove()
  }

  button.addEventListener('click', play)
  if (reduced) renderAll()
  else {
    renderAll() // something sensible if JS is slow or the observer never fires
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); play() }
    }, { threshold: 0.35 })
    io.observe(pre)
  }
}
