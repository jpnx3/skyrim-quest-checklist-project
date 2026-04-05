import { useState } from 'react'

const TYPES = [
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
const PRESET_SOURCES = ['Vanilla', 'Dawnguard', 'Dragonborn', 'Hearthfire']

const inputCls = 'w-full bg-sk-panel border border-sk-border text-sk-text placeholder-sk-muted px-3 py-2 rounded text-sm focus:outline-none focus:border-sk-gold transition-colors'

export default function QuestForm({ quest, allQuests, allTypes, hasPrev, hasNext, onSubmit, onNavigate, onClose }) {
  const [form, setForm] = useState({
    name:         quest?.name         ?? '',
    type:         quest?.type         ?? 'Side Quest',
    source:       quest?.source       ?? 'Vanilla',
    quest_giver:  quest?.quest_giver  ?? '',
    location:     quest?.location     ?? '',
    step:          quest?.step          ?? '',
    level:         quest?.level         ?? '',
    requirements:  quest?.requirements  ?? '',
    next_quest_id: quest?.next_quest_id ?? '',
    notes:         quest?.notes         ?? '',
  })

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-sk-panel border border-sk-border rounded w-full max-w-lg shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sk-border">
          <h2 className="text-base font-semibold text-white tracking-wider uppercase">
            {quest ? 'Edit Quest' : 'Add Quest'}
          </h2>
          <div className="flex items-center gap-3">
            {quest && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onNavigate(form, -1)}
                  disabled={!hasPrev}
                  className="px-2 py-1 text-sm text-white/70 disabled:opacity-20 hover:bg-sk-panel2 rounded transition-colors"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(form, 1)}
                  disabled={!hasNext}
                  className="px-2 py-1 text-sm text-white/70 disabled:opacity-20 hover:bg-sk-panel2 rounded transition-colors"
                >
                  →
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-sk-muted hover:text-sk-text text-2xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">
              Name <span className="text-sk-red">*</span>
            </label>
            <input
              value={form.name}
              onChange={set('name')}
              required
              autoFocus
              placeholder="Quest name"
              className={inputCls}
            />
          </div>

          {/* Type + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Type</label>
              <input
                value={form.type}
                onChange={set('type')}
                list="type-suggestions"
                placeholder="Quest type..."
                className={inputCls}
              />
              <datalist id="type-suggestions">
                {(allTypes ?? TYPES).map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Source</label>
              <input
                value={form.source}
                onChange={set('source')}
                list="source-suggestions"
                placeholder="Vanilla, mod name..."
                className={inputCls}
              />
              <datalist id="source-suggestions">
                {PRESET_SOURCES.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          {/* Quest Giver + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Quest Giver</label>
              <input
                value={form.quest_giver}
                onChange={set('quest_giver')}
                placeholder="NPC name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Location</label>
              <input
                value={form.location}
                onChange={set('location')}
                placeholder="Location name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Step + Level + Requirements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Step</label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.step}
                onChange={set('step')}
                placeholder="e.g. 1.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Level</label>
              <input
                type="number"
                min="1"
                value={form.level}
                onChange={set('level')}
                placeholder="e.g. 10"
                className={inputCls}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Requirements</label>
              <textarea
                value={form.requirements}
                onChange={set('requirements')}
                rows={2}
                placeholder="Any requirements..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Leads To */}
          <div>
            <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Leads To</label>
            <select value={form.next_quest_id} onChange={set('next_quest_id')} className={inputCls}>
              <option value="">— None —</option>
              {[...(allQuests ?? [])]
                .filter(q => q.id !== quest?.id)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(q => <option key={q.id} value={q.id}>{q.name}</option>)
              }
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-sk-muted mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="Any additional notes..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-sk-muted hover:text-sk-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-sk-gold-dk hover:bg-sk-gold text-sk-bg font-semibold rounded tracking-wide transition-colors border border-sk-gold"
            >
              {quest ? 'Save Changes' : 'Add Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
