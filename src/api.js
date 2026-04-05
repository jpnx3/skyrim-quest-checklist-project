// In Electron, window.api is injected by the preload script.
// In the browser, we fall back to localStorage.

const localApi = (() => {
  const KEY = 'skyrim-quests'

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] }
    catch { return [] }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
  }

  let nextId = null

  function getNextId(data) {
    if (nextId === null) {
      nextId = data.length > 0 ? Math.max(...data.map(q => q.id)) + 1 : 1
    }
    return nextId++
  }

  return {
    getQuests: async () => {
      const data = load()
      return [...data].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    },
    addQuest: async (quest) => {
      const data = load()
      const entry = { ...quest, id: getNextId(data), created_at: new Date().toISOString() }
      data.push(entry)
      save(data)
      return entry
    },
    updateQuest: async (id, quest) => {
      const data = load()
      const idx = data.findIndex(q => q.id === id)
      if (idx === -1) return null
      data[idx] = { ...data[idx], ...quest }
      save(data)
      return data[idx]
    },
    deleteQuest: async (id) => {
      save(load().filter(q => q.id !== id))
    },
  }
})()

const api = window.api ?? localApi

export default api
