import { app, BrowserWindow, nativeTheme, autoUpdater } from 'electron'
import * as path from 'path'
import * as url from 'url'
// Agrega la línea para detectar si la aplicación se está ejecutando en modo de desarrollo
const isDev = process.env.NODE_ENV === 'development'

try {
	if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
		require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
	}
} catch (_) {}

// Configuración de electron-updater
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

function sendStatusToWindow(text) {
	mainWindow.webContents.send('message', text)
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 700,
		height: 700,
		frame: false,
		useContentSize: true,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
			nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,
		},
	})

	// Cargar la URL de la aplicación
	if (isDev) {
		// En modo desarrollo, cargar desde el servidor de desarrollo
		mainWindow.loadURL(process.env.APP_URL)
	} else {
		// En modo producción, cargar desde el archivo local
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file:',
				slashes: true,
			})
		)
	}

	mainWindow.on('closed', () => {
		mainWindow = null
	})

	// Verificar actualizaciones al iniciar la aplicación (solo en producción)
	if (!isDev) {
		autoUpdater.checkForUpdatesAndNotify()
	}

	// Escuchar eventos de actualización
	autoUpdater.on('checking-for-update', () => {
		sendStatusToWindow('Checking for update...')
	})

	autoUpdater.on('update-available', (info) => {
		sendStatusToWindow('Update available.')
	})

	autoUpdater.on('update-not-available', (info) => {
		sendStatusToWindow('Update not available.')
	})

	autoUpdater.on('error', (err) => {
		sendStatusToWindow(`Error in auto-updater: ${err.toString()}`)
	})

	autoUpdater.on('download-progress', (progressObj) => {
		let logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
		sendStatusToWindow(logMessage)
	})

	autoUpdater.on('update-downloaded', (info) => {
		sendStatusToWindow('Update downloaded; will install now')
	})
}

app.on('ready', createWindow)

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
