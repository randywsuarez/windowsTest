// src/boot/uploadImage.js
const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadImage = function (imageName, imageData) {
		// Ruta para guardar las imágenes en la carpeta "LogPics"
		console.log(process.cwd().split(path.sep)[0] + path.sep)
		const imagePath = path.join(
			process.cwd().split(path.sep)[0] + path.sep,
			'..',
			'LogPics',
			imageName
		)

		// Guarda la imagen en el sistema de archivos
		try {
			fs.writeFileSync(imagePath, imageData, 'base64')
			console.log(`Imagen guardada en: ${imagePath}`)
		} catch (error) {
			console.error('Error al guardar la imagen:', error)
		}

		// Agrega la imagen al prototipo "image"
		Vue.prototype.$image = {
			name: imageName,
			path: imagePath,
		}
	}
}
