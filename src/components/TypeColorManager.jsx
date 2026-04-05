const PRESET_TYPES = [
  'Main Quest', 'College of Winterhold', 'Companions', 'Dark Brotherhood',
  'Imperial Legion', 'Stormcloaks', 'Thieves Guild', 'Daedric Quests',
  'Side Quests', 'Dawnguard', 'Dragonborn',
]

export default function TypeColorManager({ allQuests, typeColors, onChange, onClose }) {
  const allTypes = [...new Set([
    ...PRESET_TYPES,
    ...(allQuests ?? []).map(q => q.type).filter(Boolean),
  ])]

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-sk-panel border border-sk-border rounded w-full max-w-xs shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sk-border">
          <h2 className="text-sm font-semibold text-white tracking-wider uppercase">Type Colors</h2>
          <button
            onClick={onClose}
            className="text-sk-muted hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[28rem] overflow-y-auto">
          {allTypes.map(type => {
            const color = typeColors[type]
            return (
              <div key={type} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color || '#888888'}
                  onChange={e => onChange(type, e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-sk-border bg-transparent p-0.5 flex-shrink-0"
                />
                <span className="text-sm text-sk-text flex-1 truncate">{type}</span>
                {color && (
                  <button
                    onClick={() => onChange(type, null)}
                    className="text-xs text-sk-muted hover:text-white transition-colors flex-shrink-0"
                  >
                    reset
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
