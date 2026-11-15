"use client"

/**
 * Glass tab bar: a frosted bar with a soft glass pill behind the active item.
 * The pill glides with a spring when an item is picked and swells into a clear "lens"
 * while it moves. On touch screens you can also drag the pill along the bar and let go
 * on an item. Only transform and opacity animate, so it stays smooth on phones.
 */

import * as React from "react"

export type GlassTabItem = {
  label: string
  href: string
  icon: React.ReactNode
}

export type GlassTabBarProps = {
  items: GlassTabItem[]
  /** index of the active item */
  active: number
  /** called when an item is picked, by tap or by dragging the pill onto it */
  onSelect?: (index: number) => void
  className?: string
}

const DRAG_START = 6 // px of movement before a press becomes a drag

export function GlassTabBar({ items, active, onSelect, className }: GlassTabBarProps) {
  const navRef = React.useRef<HTMLElement>(null)
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([])
  const [box, setBox] = React.useState({ x: 0, w: 0, ready: false })
  const [moving, setMoving] = React.useState(false)
  const [dragX, setDragX] = React.useState<number | null>(null)
  const press = React.useRef<{ id: number; x0: number; dragging: boolean } | null>(null)
  const suppressClick = React.useRef(false)
  const moveTimer = React.useRef<number | undefined>(undefined)

  const measure = React.useCallback(() => {
    const el = itemRefs.current[active]
    if (!el) return
    setBox((prev) => {
      const next = { x: el.offsetLeft, w: el.offsetWidth, ready: true }
      if (prev.ready && Math.abs(prev.x - next.x) > 1) {
        setMoving(true)
        window.clearTimeout(moveTimer.current)
        moveTimer.current = window.setTimeout(() => setMoving(false), 380)
      }
      return next
    })
  }, [active])

  React.useLayoutEffect(() => { measure() }, [measure])
  React.useEffect(() => {
    const nav = navRef.current
    if (!nav || !window.ResizeObserver) return
    const ro = new ResizeObserver(() => {
      const el = itemRefs.current[active]
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, ready: true })
    })
    ro.observe(nav)
    return () => ro.disconnect()
  }, [active])
  React.useEffect(() => () => window.clearTimeout(moveTimer.current), [])

  /* ---- dragging the pill (touch, pen or mouse) ---- */
  const nearest = (x: number) => {
    let best = 0, dist = Infinity
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - x)
      if (d < dist) { dist = d; best = i }
    })
    return best
  }
  const localX = (clientX: number) => clientX - (navRef.current?.getBoundingClientRect().left ?? 0)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    press.current = { id: e.pointerId, x0: e.clientX, dragging: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    if (!p.dragging && Math.abs(e.clientX - p.x0) > DRAG_START) {
      p.dragging = true
      navRef.current?.setPointerCapture(e.pointerId)
    }
    if (p.dragging) {
      const nav = navRef.current!
      const min = 4, max = nav.clientWidth - box.w - 4
      setDragX(Math.max(min, Math.min(max, localX(e.clientX) - box.w / 2)))
    }
  }
  const endPress = (e: React.PointerEvent, cancelled = false) => {
    const p = press.current
    press.current = null
    if (!p || !p.dragging) return
    suppressClick.current = true
    setDragX(null)
    if (cancelled) return
    const i = nearest(localX(e.clientX))
    onSelect?.(i)
    const href = items[i]?.href
    if (href) window.location.assign(href)
  }

  const pillX = dragX ?? box.x

  return (
    <nav
      ref={navRef}
      className={["gtb", className].filter(Boolean).join(" ")}
      aria-label="Main"
      style={{ ["--gtb-n" as string]: items.length } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e)}
      onPointerCancel={(e) => endPress(e, true)}
      onClickCapture={(e) => {
        if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false }
      }}
    >
      <span
        className={["gtb-pill", moving || dragX !== null ? "is-moving" : "", dragX !== null ? "is-dragging" : ""].filter(Boolean).join(" ")}
        aria-hidden="true"
        // position with `translate` (not `transform`) so the swell (`scale`) never stretches the distance moved
        style={{ width: box.w, translate: `${pillX}px 0`, opacity: box.ready ? 1 : 0 }}
      />
      {items.map((it, i) => (
        <a
          key={it.label}
          ref={(el) => { itemRefs.current[i] = el }}
          className="gtb-item"
          href={it.href}
          aria-label={it.label}
          aria-current={i === active ? "page" : undefined}
          onClick={() => onSelect?.(i)}
          draggable={false}
        >
          <span className="gtb-icon">{it.icon}</span>
          <span className="gtb-label">{it.label}</span>
        </a>
      ))}
    </nav>
  )
}

export default GlassTabBar
