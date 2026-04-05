const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getQuests: () => ipcRenderer.invoke('quests:getAll'),
  addQuest: (quest) => ipcRenderer.invoke('quests:add', quest),
  updateQuest: (id, quest) => ipcRenderer.invoke('quests:update', id, quest),
  deleteQuest: (id) => ipcRenderer.invoke('quests:delete', id),
})
