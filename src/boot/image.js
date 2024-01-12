const fs = require('fs')
const path = require('path')

module.exports = ({ Vue }) => {
	Vue.prototype.$uploadImage = function (imageName, imageData) {
		// Verifica si la carpeta existe antes de intentar guardar la imagen
		const imagePath = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'LogPics')

		if (!fs.existsSync(imagePath)) {
			// La carpeta no existe, la creamos
			fs.mkdirSync(imagePath, { recursive: true })
		}

		// Asegúrate de que imageData sea un string válido
		//console.log('Datos de imagen:', imageData)

		// Elimina el encabezado de los datos base64 (por ejemplo, "data:image/jpeg;base64,")
		const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')

		// Convierte los datos base64 a un buffer
		const buffer = Buffer.from(base64Data, 'base64')

		const imageFilePath = path.join(imagePath, imageName)

		// Guarda el buffer como un archivo JPG dentro del directorio
		try {
			fs.writeFileSync(imageFilePath, buffer)
			console.log(`Imagen guardada: ${imageFilePath}`)
			sessionStorage.setItem('image', imageFilePath)
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
