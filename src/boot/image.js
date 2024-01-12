const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadImage = function (imageName, imageData) {
		// Ruta del directorio donde se guardarán las imágenes
		const imagesDirectory = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'LogPics')

		// Crea el directorio si no existe
		if (!fs.existsSync(imagesDirectory)) {
			fs.mkdirSync(imagesDirectory, { recursive: true })
			console.log(`Directorio creado: ${imagesDirectory}`)
		}

		// Ruta completa para guardar la imagen
		const imagePath = path.join(imagesDirectory, imageName)

		// Elimina el encabezado de los datos base64 (por ejemplo, "data:image/jpeg;base64,")
		const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')

		// Convierte los datos base64 a un buffer
		const buffer = Buffer.from(base64Data, 'base64')

		// Guarda el buffer como un archivo JPG dentro del directorio
		try {
			fs.writeFileSync(imagePath, buffer)
			console.log(`Imagen guardada: ${imagePath}`)
			sessionStorage.setItem('image', imagePath)
		} catch (error) {
			// Agrega más información al mensaje de error
			console.error('Error al guardar la imagen:', error.message)
		}

		// Agrega la imagen al prototipo "image"
		Vue.prototype.$imageFile = {
			name: imageName,
			path: imagePath,
		}
	}
}
