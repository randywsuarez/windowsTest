import { app, BrowserWindow, nativeTheme, session } from 'electron'
import path from 'path'

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        fullscreen: true,
        useContentSize: true,
        webPreferences: {
            // Cambiar a true para permitir que funcionen los módulos Node.js directamente
            nodeIntegration: true,
            
            // Desactiva contextIsolation para compatibilidad con código antiguo
            contextIsolation: false,
            
            // Asegúrate de que la ruta sea absoluta
            preload: path.resolve(__dirname, 'electron-preload.js'),
            
            // Habilita el módulo remoto para compatibilidad
            enableRemoteModule: true,
            
            // Permitir acceso a módulos nativos
            sandbox: false
        }
    })

    mainWindow.loadURL(process.env.APP_URL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

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