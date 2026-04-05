const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const QuestDatabase = require('./database')

let db

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0c0c0c',
  })

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  db = new QuestDatabase()

  ipcMain.handle('quests:getAll', () => db.getAll())
  ipcMain.handle('quests:add', (_, quest) => db.add(quest))
  ipcMain.handle('quests:update', (_, id, quest) => db.update(id, quest))
  ipcMain.handle('quests:delete', (_, id) => db.remove(id))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
