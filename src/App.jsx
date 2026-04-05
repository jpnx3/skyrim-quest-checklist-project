import { useState, useEffect, useMemo } from 'react'
import QuestForm from './components/QuestForm'
import QuestTable from './components/QuestTable'
import TypeColorManager from './components/TypeColorManager'
import api from './api'

const PRESET_TYPES = [
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

export default function App() {
  const [quests, setQuests] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)
  const [grouped, setGrouped] = useState(false)
  const [sortCol, setSortCol] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [showTypeColors, setShowTypeColors] = useState(false)
  const [typeColors, setTypeColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quest-type-colors')) || {} }
    catch { return {} }
  })

  function handleTypeColorChange(type, color) {
    const updated = { ...typeColors }
    if (color === null) {
      delete updated[type]
    } else {
      updated[type] = color
    }
    setTypeColors(updated)
    localStorage.setItem('quest-type-colors', JSON.stringify(updated))
  }

  function handleSort(key) {
    if (key === 'completed') return
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(key)
      setSortDir('asc')
    }
  }

  useEffect(() => {
    loadQuests()
  }, [])

  async function loadQuests() {
    const data = await api.getQuests()
    setQuests(data)
    return data
  }

  const allTypes = useMemo(() => {
    const custom = quests.map(q => q.type).filter(t => t && !PRESET_TYPES.includes(t))
    return [...PRESET_TYPES, ...[...new Set(custom)].sort((a, b) => a.localeCompare(b))]
  }, [quests])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    const f = quests.filter(q => {
      const matchSearch =
        !term ||
        q.name.toLowerCase().includes(term) ||
        q.quest_giver?.toLowerCase().includes(term) ||
        q.location?.toLowerCase().includes(term)
      const matchType = !filterType || q.type === filterType
      const matchSource = !filterSource || q.source === filterSource
      return matchSearch && matchType && matchSource
    })
    return f.sort((a, b) => {
      let cmp
      if (sortCol === 'level' || sortCol === 'step') {
        cmp = (Number(a[sortCol]) || 0) - (Number(b[sortCol]) || 0)
      } else {
        cmp = String(a[sortCol] ?? '').localeCompare(String(b[sortCol] ?? ''), undefined, { sensitivity: 'base' })
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [quests, search, filterType, filterSource, sortCol, sortDir])

  const sources = useMemo(
    () => [...new Set(quests.map(q => q.source))].sort((a, b) => a.localeCompare(b)),
    [quests]
  )

  async function handleSubmit(questData, keepOpen = false) {
    if (editingQuest) {
      await api.updateQuest(editingQuest.id, questData)
    } else {
      await api.addQuest(questData)
    }
    await loadQuests()
    if (!keepOpen) closeForm()
  }

  async function handleNavigate(questData, direction) {
    const sameType = filtered.filter(q => q.type === editingQuest.type)
    const idx = sameType.findIndex(q => q.id === editingQuest.id)
    const nextId = sameType[idx + direction]?.id
    if (editingQuest) {
      await api.updateQuest(editingQuest.id, questData)
    }
    const fresh = await loadQuests()
    if (nextId) {
      const next = fresh.find(q => q.id === nextId)
      if (next) setEditingQuest(next)
    }
  }

  async function handleToggleComplete(quest) {
    await api.updateQuest(quest.id, { ...quest, completed: !quest.completed })
    await loadQuests()
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this quest entry?')) {
      await api.deleteQuest(id)
      await loadQuests()
    }
  }

  function handleEdit(quest) {
    setEditingQuest(quest)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingQuest(null)
  }

  const sameTypeFiltered = editingQuest
    ? filtered.filter(q => q.type === editingQuest.type)
    : []
  const editingIdx = editingQuest ? sameTypeFiltered.findIndex(q => q.id === editingQuest.id) : -1

  return (
    <div className="min-h-screen bg-sk-bg text-sk-text flex flex-col">
      {/* Header */}
      <header className="bg-sk-panel border-b border-sk-border px-6 py-4 flex-shrink-0" style={{ WebkitAppRegion: 'drag' }}>
        <h1 className="text-2xl font-bold text-sk-gold tracking-widest uppercase">
          Skyrim Quest Compendium
        </h1>
        <p className="text-sk-muted text-sm mt-0.5">
          {quests.length} {quests.length === 1 ? 'quest' : 'quests'} catalogued
        </p>
      </header>

      {/* Toolbar */}
      <div className="bg-sk-panel2 border-b border-sk-border px-6 py-3 flex gap-3 flex-wrap items-center flex-shrink-0">
        <input
          type="text"
          placeholder="Search by name, quest giver, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-sk-panel border border-sk-border text-sk-text placeholder-sk-muted px-3 py-1.5 rounded text-sm flex-1 min-w-56 focus:outline-none focus:border-sk-gold transition-colors"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-sk-panel border border-sk-border text-sk-text px-3 py-1.5 rounded text-sm focus:outline-none focus:border-sk-gold transition-colors"
        >
          <option value="">All Types</option>
          {allTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="bg-sk-panel border border-sk-border text-sk-text px-3 py-1.5 rounded text-sm focus:outline-none focus:border-sk-gold transition-colors"
        >
          <option value="">All Sources</option>
          {sources.map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setGrouped(g => !g)}
          className={`px-4 py-1.5 rounded text-sm font-semibold tracking-wide transition-colors border ${grouped ? 'bg-white text-black border-white' : 'bg-transparent text-white border-[#2a2a2a] hover:border-white'}`}
        >
          Group by Type
        </button>
        <button
          onClick={() => setShowTypeColors(true)}
          title="Manage type colors"
          className="px-3 py-1.5 rounded text-sm transition-colors border border-[#2a2a2a] hover:border-white text-white/60 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 2a6 6 0 0 1 5.657 8H2.343A6 6 0 0 1 8 2zm-4 7a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm4-3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm4 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"/>
          </svg>
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto bg-sk-gold-dk hover:bg-sk-gold text-sk-bg hover:text-sk-bg px-4 py-1.5 rounded text-sm font-semibold tracking-wide transition-colors border border-sk-gold"
        >
          + Add Quest
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <QuestTable quests={filtered} allQuests={quests} grouped={grouped} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} typeColors={typeColors} />
      </div>

      {/* Quest Form Modal */}
      {showForm && (
        <QuestForm
          key={editingQuest?.id ?? 'new'}
          quest={editingQuest}
          allQuests={quests}
          allTypes={allTypes}
          hasPrev={editingIdx > 0}
          hasNext={editingIdx < sameTypeFiltered.length - 1}
          onSubmit={handleSubmit}
          onNavigate={handleNavigate}
          onClose={closeForm}
        />
      )}

      {/* Type Color Manager Modal */}
      {showTypeColors && (
        <TypeColorManager
          allQuests={quests}
          typeColors={typeColors}
          onChange={handleTypeColorChange}
          onClose={() => setShowTypeColors(false)}
        />
      )}
    </div>
  )
}
