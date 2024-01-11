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
		if (!fs.existsSync(imagePath)) {
			// La carpeta no existe, la creamos
			fs.mkdirSync(imagePath, { recursive: true })
		}

		// Elimina el encabezado de los datos base64 (por ejemplo, "data:image/jpeg;base64,")
		const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')

		// Convierte los datos base64 a un buffer
		const buffer = Buffer.from(base64Data, 'base64')

		// Guarda el buffer como un archivo JPG
		try {
			fs.writeFileSync(imagePath, buffer)
			console.log(`Imagen guardada: ${imagePath}`)
			sessionStorage.setItem('image', imagePath)
		} catch (error) {
			console.error('Error al guardar la imagen:', error)
		}

		// Agrega la imagen al prototipo "image"
		Vue.prototype.$imageFile = {
			name: imageName,
			path: imagePath,
		}
	}
}
