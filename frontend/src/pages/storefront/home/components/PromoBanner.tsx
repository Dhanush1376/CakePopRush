import React, { useEffect, useRef } from 'react'
import styles from './PromoBanner.module.css'

const BANNER_ITEMS_COUNT = 8

export const PromoBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const exactScroll = useRef(0)
  const isInteracting = useRef(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const momentumId = useRef<number | null>(null)
  const resumeTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let animId: number
    let prevTimestamp = performance.now()
    const speed = 40 // ~40px per second for a smooth, relaxed marquee

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1)
      prevTimestamp = timestamp

      const halfWidth = el.scrollWidth / 2

      if (!isInteracting.current && halfWidth > 0) {
        exactScroll.current += speed * dt
        el.scrollLeft = exactScroll.current

        if (el.scrollLeft >= halfWidth) {
          exactScroll.current -= halfWidth
          el.scrollLeft = exactScroll.current
        } else if (el.scrollLeft <= 0) {
          exactScroll.current += halfWidth
          el.scrollLeft = exactScroll.current
        }
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      if (momentumId.current) cancelAnimationFrame(momentumId.current)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return // Only main click / primary touch
    const el = containerRef.current
    if (!el) return

    if (momentumId.current) {
      cancelAnimationFrame(momentumId.current)
      momentumId.current = null
    }
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current)
      resumeTimer.current = null
    }

    isInteracting.current = true
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartScroll.current = el.scrollLeft
    lastX.current = e.clientX
    lastTime.current = performance.now()
    velocity.current = 0

    try {
      el.setPointerCapture(e.pointerId)
    } catch (_) {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const el = containerRef.current
    if (!el) return

    const dx = e.clientX - dragStartX.current
    const newScroll = dragStartScroll.current - dx
    el.scrollLeft = newScroll
    exactScroll.current = newScroll

    const now = performance.now()
    const dt = now - lastTime.current
    if (dt > 10) {
      velocity.current = (e.clientX - lastX.current) / dt
      lastX.current = e.clientX
      lastTime.current = now
    }

    // Seamless wrap during manual drag
    const halfWidth = el.scrollWidth / 2
    if (halfWidth > 0) {
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth
        dragStartScroll.current -= halfWidth
        exactScroll.current = el.scrollLeft
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += halfWidth
        dragStartScroll.current += halfWidth
        exactScroll.current = el.scrollLeft
      }
    }
  }

  const handlePointerUpOrCancel = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = containerRef.current
    if (!el) return

    try {
      el.releasePointerCapture(e.pointerId)
    } catch (_) {}

    // Apply smooth momentum deceleration if user flicked with finger/mouse
    if (Math.abs(velocity.current) > 0.15) {
      const applyMomentum = () => {
        if (!el || Math.abs(velocity.current) < 0.05 || isDragging.current) {
          velocity.current = 0
          resumeTimer.current = window.setTimeout(() => {
            isInteracting.current = false
          }, 1000)
          return
        }

        el.scrollLeft -= velocity.current * 14
        exactScroll.current = el.scrollLeft
        velocity.current *= 0.92

        const halfWidth = el.scrollWidth / 2
        if (halfWidth > 0) {
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth
            exactScroll.current = el.scrollLeft
          } else if (el.scrollLeft <= 0) {
            el.scrollLeft += halfWidth
            exactScroll.current = el.scrollLeft
          }
        }

        momentumId.current = requestAnimationFrame(applyMomentum)
      }

      momentumId.current = requestAnimationFrame(applyMomentum)
    } else {
      velocity.current = 0
      resumeTimer.current = window.setTimeout(() => {
        isInteracting.current = false
      }, 1000)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    const el = containerRef.current
    if (!el) return

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
    if (delta !== 0) {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      isInteracting.current = true
      el.scrollLeft += delta
      exactScroll.current = el.scrollLeft

      const halfWidth = el.scrollWidth / 2
      if (halfWidth > 0) {
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth
          exactScroll.current = el.scrollLeft
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += halfWidth
          exactScroll.current = el.scrollLeft
        }
      }

      resumeTimer.current = window.setTimeout(() => {
        isInteracting.current = false
      }, 1000)
    }
  }

  const renderBannerItems = (prefix: string) => (
    Array.from({ length: BANNER_ITEMS_COUNT }).map((_, i) => (
      <span key={`${prefix}-${i}`} className={styles.textSpan}>
        GET 20% OFF YOUR FIRST ORDER WITH CODE: <strong>RUSH20</strong> • FREE SHIPPING ON ORDERS OVER 250/- •
      </span>
    ))
  )

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onWheel={handleWheel}
      role="region"
      aria-label="Promotional announcements"
    >
      <div className={styles.track}>
        <div className={styles.half}>
          {renderBannerItems('h1')}
        </div>
        <div className={styles.half} aria-hidden="true">
          {renderBannerItems('h2')}
        </div>
      </div>
    </div>
  )
}
