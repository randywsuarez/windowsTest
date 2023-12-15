const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadImage = function (imageName, imageData) {
		// ... (tu código actual)
		const imagePath = path.join(
			process.cwd().split(path.sep)[0] + path.sep,
			'..',
			'LogPics',
			imageName
		)

		// Elimina el encabezado de los datos base64 (por ejemplo, "data:image/jpeg;base64,")
		const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')

		// Convierte los datos base64 a un buffer
		const buffer = Buffer.from(base64Data, 'base64')

		// Guarda el buffer como un archivo JPG
		try {
			fs.writeFileSync(imagePath, buffer)
			console.log(`Imagen guardada: ${imagePath}`)
		} catch (error) {
			console.error('Error al guardar la imagen:', error)
		}

		// Agrega la imagen al prototipo "image"
		Vue.prototype.$image = {
			name: imageName,
			path: imagePath,
		}
	}

	Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
		// Ruta para guardar los archivos de texto en la carpeta "Logs"
		const textFilePath = path.join(
			process.cwd().split(path.sep)[0] + path.sep,
			'..',
			'Log',
			fileName + '.txt' // Agrega la extensión .txt al nombre del archivo
		)

		// Guarda el contenido del archivo de texto
		try {
			fs.writeFileSync(textFilePath, fileContent)
			console.log(`Archivo de texto guardado: ${textFilePath}`)
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
