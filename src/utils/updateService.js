// updateService.js
const axios = require('axios')
const fs = require('fs')
const fsPromises = require('fs').promises
const AdmZip = require('adm-zip')
const path = require('path')
const env = require('./env')
const { exec } = require('child_process')

class UpdateService {
	constructor(user, repository, version, token) {
		this.usuario = user
		this.repositorio = repository
		this.versionActual = version
		this.archivoDescarga = 'update.zip'
		this.carpetaDestino = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'update')
		this.token = token
	}

	async verificarActualizacion() {
		try {
			console.log('verificarActualizacion')
			const options = {
				method: 'GET',
				headers: {
					'User-Agent': 'insomnia/2023.5.8',
					Authorization: this.token,
				},
			}
			const response = await fetch(
				`https://api.github.com/repos/${this.usuario}/${this.repositorio}/releases/latest`,
				options
			)
			const data = await response.json()
			console.log(data)

			const ultimaVersion = data.tag_name

			if (this.compararVersiones(ultimaVersion, this.versionActual) > 0) {
				return { result: true, version: ultimaVersion, body: data.body } // Hay una nueva versión disponible
			} else {
				return { result: false } // La versión actual es la más reciente
			}
		} catch (error) {
			console.error('Error al verificar la actualización:', error.message)
			return false
		}
	}

	async descargarYDescomprimir(version) {
		try {
			// Verificar si existe un archivo previo en la carpeta de destino y eliminarlo
			const rutaArchivo = path.join(this.carpetaDestino, this.archivoDescarga)
			try {
				await fsPromises.access(rutaArchivo)
				// Si el archivo existe, lo eliminamos
				await fsPromises.unlink(rutaArchivo)
				console.log(`Archivo previo eliminado: ${this.archivoDescarga}`)
			} catch (unlinkError) {
				// Si no se pudo eliminar, puede ser porque el archivo no existe, no es un problema
			}

			// Descargar el archivo update.zip
			const zipResponse = await fetch(
				`https://github.com/${this.usuario}/${this.repositorio}/releases/download/${version}/${this.archivoDescarga}`,
				{ follow: 5 } // Máximo número de redirecciones permitidas
			)

			// Crear o verificar la existencia de la carpeta de destino
			try {
				await fsPromises.access(this.carpetaDestino)
			} catch (accessError) {
				// Si la carpeta no existe, la creamos
				await fsPromises.mkdir(this.carpetaDestino, { recursive: true })
				console.log(`Directorio creado: ${this.carpetaDestino}`)
			}

			// Guardar el nuevo archivo update.zip en la carpeta de destino
			await fsPromises.writeFile(rutaArchivo, Buffer.from(await zipResponse.arrayBuffer()))

			// Descomprimir el archivo update.zip
			const zip = new AdmZip(rutaArchivo)
			zip.extractAllTo(this.carpetaDestino, /*overwrite*/ true)

			// Eliminar el archivo update.zip después de descomprimirlo
			await fsPromises.unlink(rutaArchivo)
			console.log(`Archivo update.zip eliminado después de descomprimir`)

			return true // Descarga, descompresión y eliminación exitosas
		} catch (error) {
			console.error('Error al descargar, descomprimir o eliminar el archivo:', error.message)
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
	async program() {
		let exePath = path.join(process.cwd().split(path.sep)[0] + path.sep) // Reemplaza con la ruta correcta de tu archivo .exe
		exePath = path.join(exePath + 'update.exe')
		exec(exePath, (err, stdout, stderr) => {
			if (err) {
				console.error(err)
				return
			}
			console.log(`stdout: ${stdout}`)
			console.error(`stderr: ${stderr}`)
		})
	}
}

module.exports = UpdateService
