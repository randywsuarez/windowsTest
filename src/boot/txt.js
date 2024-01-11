const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
		// Ruta para guardar los archivos de texto en la carpeta "Logs"
		const logsFolderPath = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'Logs')

		// Verificar si la carpeta "Logs" existe, si no, crearla
		if (!fs.existsSync(logsFolderPath)) {
			try {
				fs.mkdirSync(logsFolderPath)
				console.log(`Carpeta "Logs" creada en: ${logsFolderPath}`)
			} catch (error) {
				console.error('Error al crear la carpeta "Logs":', error)
				return // Detener la ejecución si hay un error al crear la carpeta
			}
		}

		// Ruta completa del archivo de texto
		const textFilePath = path.join(logsFolderPath, fileName + '.txt')

		// Guarda el contenido del archivo de texto
		try {
			fs.writeFileSync(textFilePath, fileContent)
			console.log(`Archivo de texto guardado: ${textFilePath}`)
			sessionStorage.setItem('txt', textFilePath)
		} catch (error) {
			console.error('Error al guardar el archivo de texto:', error)
		}

		// Agrega el archivo de texto al prototipo "textFile"
		Vue.prototype.$textFile = {
			name: fileName,
			path: textFilePath,
		}
	}
}
