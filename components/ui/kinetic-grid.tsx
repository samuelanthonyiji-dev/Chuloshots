"use client"

/**
 * Kinetic Grid: a canvas background of dots that warp toward the pointer and
 * ripple outward on click or tap. Dots spring back into the grid when left alone.
 * When nobody has interacted for a few seconds, a soft ripple runs on its own so
 * phones (no hover) still see it move. Pauses when off screen; respects reduced motion.
 *
 * Fills its positioned parent. Pointer events are read from the nearest ancestor marked
 * `data-kinetic-host` (or the parent), so links and buttons layered above the canvas stay clickable.
 */

import * as React from "react"

export type KineticGridProps = {
  /** Distance between dots in px. */
  spacing?: number
  /** Resting dot colour (rgb triple). */
  dot?: [number, number, number]
  /** Colour dots glow toward near the pointer and in ripples. */
  glow?: [number, number, number]
  /** Radius in px the pointer bends the grid within. */
  reach?: number
  className?: string
}

type Ripple = { x: number; y: number; t: number }

export function KineticGrid({
  spacing = 28,
  dot = [255, 255, 255],
  glow = [138, 164, 255],
  reach = 170,
  className,
}: KineticGridProps) {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const events: HTMLElement = canvas.closest<HTMLElement>("[data-kinetic-host]") ?? host
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0, h = 0, dpr = 1
    let cols = 0, rows = 0
    let px = new Float32Array(0), py = new Float32Array(0) // current dot positions
    const pointer = { x: -9999, y: -9999, on: 0, target: 0 }
    const ripples: Ripple[] = []
    let raf = 0, visible = true, last = performance.now(), lastInput = performance.now()

    const layout = () => {
      const r = host.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height))
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + "px"; canvas.style.height = h + "px"
      cols = Math.ceil(w / spacing) + 1; rows = Math.ceil(h / spacing) + 1
      px = new Float32Array(cols * rows); py = new Float32Array(cols * rows)
      const ox = (w - (cols - 1) * spacing) / 2, oy = (h - (rows - 1) * spacing) / 2
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { px[j * cols + i] = ox + i * spacing; py[j * cols + i] = oy + j * spacing }
      draw(0)
    }

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const ox = (w - (cols - 1) * spacing) / 2, oy = (h - (rows - 1) * spacing) / 2
      const ease = still ? 1 : 1 - Math.pow(0.0008, dt) // frame-rate independent spring-in
      pointer.on += (pointer.target - pointer.on) * (still ? 1 : Math.min(1, dt * 6))
      const R2 = reach * reach
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          const bx = ox + i * spacing, by = oy + j * spacing
          let tx = bx, ty = by, heat = 0
          // bend toward the pointer
          if (pointer.on > 0.01) {
            const dx = pointer.x - bx, dy = pointer.y - by, d2 = dx * dx + dy * dy
            if (d2 < R2 * 4) {
              const f = Math.exp(-d2 / R2) * pointer.on
              tx += dx * f * 0.32; ty += dy * f * 0.32
              heat = Math.max(heat, f)
            }
          }
          // ripples push dots outward along a moving wave front
          for (let n = 0; n < ripples.length; n++) {
            const rp = ripples[n], dx = bx - rp.x, dy = by - rp.y
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const front = rp.t * 520, fall = Math.max(0, 1 - rp.t / 1.6)
            const a = Math.exp(-((d - front) * (d - front)) / 1800) * 14 * fall
            if (a > 0.05) { tx += (dx / d) * a; ty += (dy / d) * a; heat = Math.max(heat, a / 14) }
          }
          px[k] += (tx - px[k]) * ease; py[k] += (ty - py[k]) * ease
          const r = 1.15 + heat * 1.6
          const al = 0.16 + heat * 0.7
          const c0 = dot[0] + (glow[0] - dot[0]) * heat, c1 = dot[1] + (glow[1] - dot[1]) * heat, c2 = dot[2] + (glow[2] - dot[2]) * heat
          ctx.fillStyle = `rgba(${c0 | 0},${c1 | 0},${c2 | 0},${al.toFixed(3)})`
          ctx.beginPath(); ctx.arc(px[k], py[k], r, 0, Math.PI * 2); ctx.fill()
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      for (let n = ripples.length - 1; n >= 0; n--) { ripples[n].t += dt; if (ripples[n].t > 1.8) ripples.splice(n, 1) }
      // a soft ripple of its own after a quiet spell, so touch screens see it move too
      if (now - lastInput > 4200 && ripples.length === 0) {
        ripples.push({ x: w * (0.2 + Math.random() * 0.6), y: h * (0.2 + Math.random() * 0.5), t: 0 })
        lastInput = now
      }
      draw(dt)
      raf = visible ? requestAnimationFrame(tick) : 0
    }
    const start = () => { if (!raf && !still) { last = performance.now(); raf = requestAnimationFrame(tick) } }

    const local = (e: PointerEvent) => { const r = host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0) return
      const p = local(e); pointer.x = p.x; pointer.y = p.y; pointer.target = 1; lastInput = performance.now(); start()
    }
    const onLeave = () => { pointer.target = 0 }
    const onDown = (e: PointerEvent) => {
      const p = local(e); ripples.push({ x: p.x, y: p.y, t: 0 }); if (ripples.length > 6) ripples.shift()
      lastInput = performance.now(); start()
    }
    const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") pointer.target = 0 }

    events.addEventListener("pointermove", onMove, { passive: true })
    events.addEventListener("pointerleave", onLeave, { passive: true })
    events.addEventListener("pointerdown", onDown, { passive: true })
    events.addEventListener("pointerup", onUp, { passive: true })
    events.addEventListener("pointercancel", onLeave, { passive: true })
    const ro = new ResizeObserver(layout); ro.observe(host)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start() })
    io.observe(host)
    layout(); start()

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      events.removeEventListener("pointermove", onMove)
      events.removeEventListener("pointerleave", onLeave)
      events.removeEventListener("pointerdown", onDown)
      events.removeEventListener("pointerup", onUp)
      events.removeEventListener("pointercancel", onLeave)
    }
  }, [spacing, dot, glow, reach])

  return <canvas ref={ref} className={className} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
}

export default KineticGrid
