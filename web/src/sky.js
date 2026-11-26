// SPDX-License-Identifier: AGPL-3.0-only
// Star field in three layers (far, middle, near) turning at different, very
// slow speeds, with a soft twinkle. Same sky as the Polaris site, minus
// Polaris. prefers-reduced-motion: a single still frame.

const TAU = Math.PI * 2
const OMEGA = 0.0022 // rad/s for the middle layer
const SPEED = [0.45, 1, 2.4]

export function startSky(canvas, reduced) {
  const ctx = canvas.getContext('2d')
  let W = 0, H = 0, dpr = 1, P = { x: 0, y: 0 }
  let layers = [[], [], []]
  let raf = 0, last = 0

  let s = 0x9e3779b9 // seeded: same sky on every visit
  const rnd = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) | 0), ((s ^ (s >>> 13)) >>> 0) / 4294967296)

  function build() {
    s = 0x9e3779b9
    P = { x: W * 0.72, y: H * 0.38 }
    const rMax = Math.hypot(Math.max(P.x, W - P.x), Math.max(P.y, H - P.y)) + 20
    const area = W * H
    const counts = [
      Math.round(Math.min(480, Math.max(130, area / 2600))),
      Math.round(Math.min(190, Math.max(60, area / 7000))),
      Math.round(Math.min(60, Math.max(18, area / 20000))),
    ]
    layers = counts.map((n, li) => {
      const arr = []
      for (let i = 0; i < n; i++) {
        const r = rMax * Math.sqrt(rnd()), th = rnd() * TAU
        const big = rnd() < (li === 2 ? 0.35 : 0.12)
        arr.push({
          dx: r * Math.cos(th), dy: r * Math.sin(th),
          size: [0.4, 0.55, 0.9][li] + rnd() * [0.45, 0.7, 1.0][li] + (big ? 0.55 : 0),
          a: [0.28, 0.4, 0.55][li] + rnd() * 0.4,
          ph: rnd() * TAU, sp: 0.25 + rnd() * 0.7, cyan: rnd() < 0.3,
        })
      }
      return arr
    })
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth; H = window.innerHeight
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    build()
    draw(performance.now() / 1000)
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H)
    for (let li = 0; li < 3; li++) {
      const a = reduced ? 0 : t * OMEGA * SPEED[li]
      const c = Math.cos(a), sn = Math.sin(a)
      for (const st of layers[li]) {
        const x = P.x + st.dx * c - st.dy * sn, y = P.y + st.dx * sn + st.dy * c
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue
        const tw = reduced ? 1 : 0.72 + 0.28 * Math.sin(t * st.sp + st.ph)
        ctx.fillStyle = st.cyan ? `rgba(160,225,255,${st.a * tw})` : `rgba(235,240,255,${st.a * tw})`
        ctx.beginPath(); ctx.arc(x, y, st.size, 0, TAU); ctx.fill()
        if (li === 2 && st.size > 1.5) {
          ctx.fillStyle = `rgba(160,225,255,${0.08 * tw})`
          ctx.beginPath(); ctx.arc(x, y, st.size * 3.2, 0, TAU); ctx.fill()
        }
      }
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame)
    if (now - last < 33) return // ~30 fps is plenty for a slow sky
    last = now
    draw(now / 1000)
  }

  window.addEventListener('resize', resize)
  resize()
  if (!reduced) {
    raf = requestAnimationFrame(frame)
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(frame)
    })
  }
}
