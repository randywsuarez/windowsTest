// updateService.js
const axios = require('axios')
const fs = require('fs')
const AdmZip = require('adm-zip')
const path = require('path')
const env = require('./env')

class UpdateService {
	constructor() {
		this.usuario = env.github.user
		this.repositorio = env.github.repository
		this.versionActual = env.version
		this.archivoDescarga = 'update.zip'
		this.carpetaDestino = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'update')
	}

	async verificarActualizacion() {
		try {
			const response = await axios.get(
				`https://api.github.com/repos/${this.usuario}/${this.repositorio}/releases/latest`
			)
			const ultimaVersion = response.data.tag_name

			console.log(response.data)

			if (this.compararVersiones(ultimaVersion, this.versionActual) > 0) {
				return true // Hay una nueva versión disponible
			} else {
				return false // La versión actual es la más reciente
			}
		} catch (error) {
			console.error('Error al verificar la actualización:', error.message)
			return false
		}
	}

	async descargarYDescomprimir() {
		try {
			// Verificar si existe un archivo previo en la carpeta de destino y eliminarlo
			const rutaArchivo = path.join(this.carpetaDestino, this.archivoDescarga)
			if (fs.existsSync(rutaArchivo)) {
				fs.unlinkSync(rutaArchivo)
				console.log(`Archivo previo eliminado: ${this.archivoDescarga}`)
			}

			// Descargar el archivo update.zip
			const zipResponse = await axios({
				url: `https://github.com/${this.usuario}/${this.repositorio}/releases/download/latest/${this.archivoDescarga}`,
				responseType: 'arraybuffer',
			})

			// Crear o verificar la existencia de la carpeta de destino
			if (!fs.existsSync(this.carpetaDestino)) {
				fs.mkdirSync(this.carpetaDestino, { recursive: true })
				console.log(`Directorio creado: ${this.carpetaDestino}`)
			}

			// Guardar el nuevo archivo update.zip en la carpeta de destino
			fs.writeFileSync(rutaArchivo, zipResponse.data)

			// Descomprimir el archivo update.zip
			const zip = new AdmZip(rutaArchivo)
			zip.extractAllTo(this.carpetaDestino, /*overwrite*/ true)

			return true // Descarga y descompresión exitosas
		} catch (error) {
			console.error('Error al descargar y descomprimir el archivo:', error.message)
			return false
		}
	}

	compararVersiones(version1, version2) {
		const v1 = version1.split('.').map(Number)
		const v2 = version2.split('.').map(Number)

		for (let i = 0; i < v1.length; i++) {
			if (v1[i] > v2[i]) {
				return 1
			} else if (v1[i] < v2[i]) {
				return -1
			}
		}

		return 0
	}
}

module.exports = UpdateService
