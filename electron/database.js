const fs = require('fs')
const path = require('path')
const { app } = require('electron')

class QuestDatabase {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'quests.json')
    this.data = this._load()
    this.nextId = this.data.length > 0
      ? Math.max(...this.data.map(q => q.id)) + 1
      : 1
  }

  _load() {
    try {
      return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'))
    } catch {
      return []
    }
  }

  _save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2))
  }

  getAll() {
    return [...this.data].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  }

  add(quest) {
    const entry = { ...quest, id: this.nextId++, created_at: new Date().toISOString() }
    this.data.push(entry)
    this._save()
    return entry
  }

  update(id, quest) {
    const idx = this.data.findIndex(q => q.id === id)
    if (idx === -1) return null
    this.data[idx] = { ...this.data[idx], ...quest }
    this._save()
    return this.data[idx]
  }

  remove(id) {
    this.data = this.data.filter(q => q.id !== id)
    this._save()
  }
}

module.exports = QuestDatabase
