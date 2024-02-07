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

		// Ruta completa del archivo de texto original
		const textFilePath = path.join(logsFolderPath, fileName + '.txt')

		// Guarda el contenido del archivo de texto original
		try {
			fs.writeFileSync(textFilePath, fileContent)
			console.log(`Archivo de texto original guardado: ${textFilePath}`)
			sessionStorage.setItem('txt', textFilePath)
		} catch (error) {
			console.error('Error al guardar el archivo de texto original:', error)
		}

		// Ruta completa del archivo de texto en Base64
		const base64FilePath = path.join(logsFolderPath, fileName + '.txt')

		// Guarda el contenido del archivo de texto en Base64
		const base64Content = Buffer.from(fileContent).toString('base64')

		try {
			fs.writeFileSync(base64FilePath, base64Content)
			console.log(`Archivo de texto en Base64 guardado: ${base64FilePath}`)
			sessionStorage.setItem('base64Txt', base64FilePath)
		} catch (error) {
			console.error('Error al guardar el archivo de texto en Base64:', error)
		}

		// Agrega información sobre los archivos al prototipo "textFile"
		Vue.prototype.$textFile = {
			original: {
				name: fileName,
				path: textFilePath,
			},
			base64: {
				name: fileName + '_base64',
				path: base64Content,
			},
		}
		return {
			SerialNumber: fileName,
			EmployeeID: '',
			FileType: '2',
			fileExtension: '.txt',
			fileBase64Str: base64Content,
		}
	}
}
