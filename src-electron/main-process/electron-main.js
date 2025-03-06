import { app, BrowserWindow, nativeTheme, session, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

// Initialize the electron-updater module if available
let autoUpdater = null
try {
  const { autoUpdater: updater } = require('electron-updater')
  autoUpdater = updater
} catch (error) {
  console.log('electron-updater not available, skipping auto-update initialization')
}

// Initialize remote module for Electron modern versions
const remoteMain = require('@electron/remote/main')
remoteMain.initialize()

let mainWindow

// Check if the app is portable
const isPortable = !app.isPackaged || fs.existsSync(path.join(process.resourcesPath, 'portable'))

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    fullscreen: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.resolve(__dirname, 'electron-preload.js'),
      enableRemoteModule: true,
      sandbox: false
    }
  })

  // Enable remote module for this window
  remoteMain.enable(mainWindow.webContents)

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Configure auto updater if available
  if (autoUpdater) {
    configureAutoUpdater()
  }
}

// Configure auto updater
function configureAutoUpdater() {
  // Set logger for autoUpdater
  autoUpdater.logger = require('electron-log')
  autoUpdater.logger.transports.file.level = 'info'

  // For portable apps, change the update path
  if (isPortable) {
    const updatesPath = path.join(app.getPath('userData'), 'updates')
    autoUpdater.updateConfigPath = updatesPath
  }

  // Disable auto download
  autoUpdater.autoDownload = false

  // Configure events
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking-for-update')
  })

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('update-available')
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('update-not-available')
  })

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow('update-downloaded')
    mainWindow.webContents.send('update-downloaded')
  })
}

// Send status to renderer window
function sendStatusToWindow(status, data) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', status, data)
  }
}

// IPC handlers for updates
ipcMain.on('check-for-updates', (event, options) => {
  if (autoUpdater) {
    autoUpdater.channel = options?.channel || 'latest'
    autoUpdater.checkForUpdates()
  } else {
    // If autoUpdater not available, tell renderer to check manually
    mainWindow.webContents.send('check-updates-manually')
  }
})

ipcMain.on('download-update', () => {
  if (autoUpdater) {
    autoUpdater.downloadUpdate()
  }
})

ipcMain.on('install-update', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall()
  }
})

// For manual updates (quit and restart)
ipcMain.on('quit-app', () => {
  app.quit()
})

ipcMain.on('restart-app', () => {
  app.relaunch()
  app.exit()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})