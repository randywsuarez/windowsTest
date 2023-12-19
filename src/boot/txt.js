const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
		// Ruta para guardar los archivos de texto en la carpeta "Logs"
		const textFilePath = path.join(
			process.cwd().split(path.sep)[0] + path.sep,
			'..',
			'Logs',
			fileName + '.txt' // Agrega la extensión .txt al nombre del archivo
		)

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
