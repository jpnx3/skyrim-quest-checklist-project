import { useState, useRef, useMemo } from 'react'
import Tooltip from './Tooltip'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const TYPE_ORDER = [
  'Main Quest',
  'College of Winterhold',
  'Companions',
  'Dark Brotherhood',
  'Imperial Legion',
  'Stormcloaks',
  'Thieves Guild',
  'Daedric Quests',
  'Side Quests',
  'Dawnguard',
  'Dragonborn',
]

const COLUMNS = [
  { key: 'completed',   label: '',             minW: 28,  defaultW: 32  },
  { key: 'step',        label: 'Step',         minW: 44,  defaultW: 56  },
  { key: 'level',       label: 'Level',        minW: 44,  defaultW: 64  },
  { key: 'name',        label: 'Name',         minW: 100, defaultW: 220 },
  { key: 'source',      label: 'Source',       minW: 60,  defaultW: 100 },
  { key: 'type',        label: 'Type',         minW: 60,  defaultW: 120 },
  { key: 'location',    label: 'Location',     minW: 60,  defaultW: 140 },
  { key: 'quest_giver', label: 'Quest Giver',  minW: 60,  defaultW: 140 },
  { key: 'actions',     label: '',             minW: 80,  defaultW: 96  },
]

const COL_SPAN = COLUMNS.length

const DEFAULT_WIDTHS = Object.fromEntries(COLUMNS.map(c => [c.key, c.defaultW]))

function loadWidths() {
  try {
    const saved = JSON.parse(localStorage.getItem('quest-col-widths'))
    return saved ? { ...DEFAULT_WIDTHS, ...saved } : DEFAULT_WIDTHS
  } catch {
    return DEFAULT_WIDTHS
  }
}

export default function QuestTable({ quests, allQuests, grouped, sortCol, sortDir, onSort, onEdit, onDelete, onToggleComplete, typeColors = {} }) {
  const questMap = useMemo(() => Object.fromEntries((allQuests ?? []).map(q => [q.id, q.name])), [allQuests])
  const [collapsed, setCollapsed] = useState({})
  const [colWidths, setColWidths] = useState(loadWidths)
  const dragRef = useRef(null)
  const sorted = quests

  function toggleGroup(type) {
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }))
  }

  function startResize(e, key, minW) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = colWidths[key]
    dragRef.current = key

    function onMove(e) {
      const w = Math.max(minW, startW + e.clientX - startX)
      setColWidths(prev => {
        const next = { ...prev, [key]: w }
        localStorage.setItem('quest-col-widths', JSON.stringify(next))
        return next
      })
    }

    function onUp() {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const groups = useMemo(() => {
    if (!grouped) return null
    const map = {}
    for (const q of sorted) {
      const key = q.type || 'Other'
      if (!map[key]) map[key] = []
      map[key].push(q)
    }
    return TYPE_ORDER
      .filter(t => map[t])
      .map(t => ({ type: t, quests: map[t] }))
      .concat(
        Object.keys(map)
          .filter(t => !TYPE_ORDER.includes(t))
          .map(t => ({ type: t, quests: map[t] }))
      )
  }, [sorted, grouped])

  if (quests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-sk-muted">
        <p className="text-lg font-medium text-white/40">No quests found</p>
        <p className="text-sm mt-1 text-white">Add your first quest or adjust your filters.</p>
      </div>
    )
  }

  const cellCls = 'py-2.5 pr-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-0'

  function renderRow(quest) {
    return (
      <tr
        key={quest.id}
        className={`border-b border-sk-border/50 hover:bg-sk-panel2 transition-colors group ${quest.completed ? 'opacity-40' : ''}`}
      >
        <td className="py-2.5 pr-2">
          <input
            type="checkbox"
            checked={!!quest.completed}
            onChange={() => onToggleComplete(quest)}
            className="w-4 h-4 cursor-pointer accent-white"
          />
        </td>
        <td className={`${cellCls} text-sk-muted`}>{quest.step || '—'}</td>
        <td className={`${cellCls} text-sk-muted`}>
          {quest.level || '—'}
          {quest.requirements && <Tooltip label="[req]" text={quest.requirements} />}
        </td>
        <td className={`${cellCls} font-medium text-sk-text`}>
          {quest.name}
          {quest.next_quest_id && questMap[quest.next_quest_id] && (
            <span className="ml-2 text-white/40 text-xs font-normal">
              → {questMap[quest.next_quest_id]}
            </span>
          )}
          {quest.notes && <Tooltip label="[note]" text={quest.notes} />}
        </td>
        <td className={`${cellCls} text-sk-text`}>{quest.source}</td>
        <td className="py-2.5 pr-4 overflow-hidden max-w-0">
          {(() => {
            const c = typeColors[quest.type]
            return (
              <span
                className="px-2 py-0.5 rounded text-xs font-medium border inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                style={c ? { color: c, backgroundColor: hexToRgba(c, 0.1), borderColor: hexToRgba(c, 0.3) }
                         : { color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {quest.type}
              </span>
            )
          })()}
        </td>
        <td className={`${cellCls} text-sk-muted`}>{quest.location || '—'}</td>
        <td className={`${cellCls} text-sk-muted`}>{quest.quest_giver || '—'}</td>
        <td className="py-2.5 overflow-hidden max-w-0">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(quest)} className="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-sk-panel transition-colors">
              Edit
            </button>
            <button onClick={() => onDelete(quest.id)} className="text-sk-red hover:text-sk-red-lt text-xs px-2 py-1 rounded hover:bg-sk-panel transition-colors">
              Delete
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: COLUMNS.reduce((s, c) => s + colWidths[c.key], 0) }}>
      <colgroup>
        {COLUMNS.map(col => (
          <col key={col.key} style={{ width: colWidths[col.key] }} />
        ))}
      </colgroup>
      <thead>
        <tr className="text-left text-sk-muted text-xs uppercase tracking-widest">
          {COLUMNS.map(col => (
            <th
              key={col.key}
              onClick={() => col.key !== 'actions' && onSort(col.key)}
              className="relative pb-2 font-medium border-b border-sk-border select-none overflow-hidden"
              style={{ cursor: col.key === 'actions' ? 'default' : 'pointer' }}
            >
              <span className="block pr-3 overflow-hidden text-ellipsis whitespace-nowrap transition-colors hover:text-white">
                {col.label}
                {sortCol === col.key && (
                  <span className="ml-1 text-white">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </span>
              {/* Resize handle */}
              <div
                className="absolute right-0 top-0 h-full w-2 cursor-col-resize group/handle flex items-center justify-center"
                onMouseDown={e => startResize(e, col.key, col.minW)}
              >
                <div className="w-px h-3/4 bg-sk-border group-hover/handle:bg-white/40 transition-colors" />
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grouped && groups ? (
          groups.map(({ type, quests: groupQuests }) => {
            const isCollapsed = collapsed[type]
            const groupColor = typeColors[type]
            return [
              <tr key={`group-${type}`} className="border-b border-sk-border bg-sk-panel2 cursor-pointer select-none" onClick={() => toggleGroup(type)}>
                <td colSpan={COL_SPAN} className="py-2 px-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sk-muted text-xs">{isCollapsed ? '▶' : '▼'}</span>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: groupColor ?? 'rgba(255,255,255,0.6)' }}
                    >{type}</span>
                    <span className="text-sk-muted text-xs">{groupQuests.length} {groupQuests.length === 1 ? 'quest' : 'quests'}</span>
                  </div>
                </td>
              </tr>,
              ...(!isCollapsed ? groupQuests.map(renderRow) : [])
            ]
          })
        ) : (
          sorted.map(renderRow)
        )}
      </tbody>
    </table>
  )
}
