const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
		const logsFolderPath = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'Logs')

		// Crear la carpeta "Logs" si no existe
		try {
			if (!fs.existsSync(logsFolderPath)) {
				fs.mkdirSync(logsFolderPath)
				console.log(`Carpeta "Logs" creada en: ${logsFolderPath}`)
			}
		} catch (error) {
			console.error('Error al crear la carpeta "Logs":', error)
			return // Detener la ejecución si hay un error al crear la carpeta
		}

		// Función para guardar archivos
		const saveFile = (filePath, content) => {
			try {
				fs.writeFileSync(filePath, content)
				console.log(`Archivo guardado: ${filePath}`)
				return true
			} catch (error) {
				console.error(`Error al guardar el archivo: ${filePath}`, error)
				return false
			}
		}

		const textFilePath = path.join(logsFolderPath, `${fileName}.txt`)
		const base64Content = Buffer.from(fileContent).toString('base64')

		// Guardar archivo original
		if (saveFile(textFilePath, fileContent)) {
			sessionStorage.setItem('txt', textFilePath)
		}

		Vue.prototype.$textFile = {
			original: {
				name: fileName,
				path: textFilePath,
			},
			base64: {
				name: `${fileName}_base64`,
				content: base64Content, // Añadir el contenido base64 directamente aquí para referencia
			},
		}

		return {
			SerialNumber: fileName,
			EmployeeID: '',
			FileType: '1',
			fileExtension: '.txt',
			fileBase64Str: base64Content,
		}
	}

	Vue.prototype.$readTextFile = function (filePath) {
		try {
			const fileContent = fs.readFileSync(filePath, 'utf-8')
			console.log(`Contenido del archivo ${filePath} leído con éxito`)
			return fileContent
		} catch (error) {
			console.error(`Error al leer el archivo ${filePath}:`, error)
			return null // Retorna null si hay un error
		}
	}
}
