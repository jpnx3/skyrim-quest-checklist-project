import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({ label, text }) {
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  function handleMouseEnter() {
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ x: r.left + r.width / 2, y: r.top })
  }

  function handleMouseLeave() {
    setPos(null)
  }

  return (
    <span className="relative inline-block ml-2">
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-white/40 hover:text-white/80 text-xs cursor-default select-none transition-colors"
      >
        {label}
      </span>
      {pos && createPortal(
        <div
          className="fixed z-[9999] w-64 bg-sk-panel2 border border-sk-border rounded shadow-xl p-3 text-xs text-white leading-relaxed pointer-events-none"
          style={{ left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}
        >
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">
            {label === '[note]' ? 'Note' : 'Requirements'}
          </div>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sk-border" />
        </div>,
        document.body
      )}
    </span>
  )
}
