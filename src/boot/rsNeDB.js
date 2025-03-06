// src/boot/rsNeDB.js

import path from 'path'
import fs from 'fs'
const { v4: uuidv4 } = require('uuid'); // 🔥 Usamos require en lugar de import

export default async ({ Vue }) => {
	class RsNeDB {
		constructor(databaseName) {
			// Usamos require para obtener electron en tiempo de ejecución
			const electron = require('electron');
			
			// Para Electron moderno (versiones recientes)
			let appPath;
			
			if (electron.remote) {
				// Para versiones antiguas de Electron
				appPath = electron.remote.app.getAppPath();
			} else if (window.electronAPI && window.electronAPI.getAppPath) {
				// Usando electronAPI que definimos en preload
				appPath = window.electronAPI.getAppPath();
			} else {
				// Fallback: usar el directorio de trabajo actual
				appPath = process.cwd();
				console.warn('No se pudo determinar appPath con electron.remote o electronAPI, usando fallback');
			}
			
			this.dbFolderPath = path.join(path.dirname(appPath), 'data')
			this.dbPath = path.join(this.dbFolderPath, `${databaseName}.json`)

			if (!fs.existsSync(this.dbFolderPath)) {
				fs.mkdirSync(this.dbFolderPath, { recursive: true })
			}

			if (!fs.existsSync(this.dbPath)) {
				fs.writeFileSync(this.dbPath, '{"data": []}')
			}
		}

		async find(query) {
			const jsonData = this.readDatabase()
			return jsonData.data.filter((doc) => {
				// Implementa lógica de filtrado según tu consulta (query)
				return true
			})
		}

		async findOne(query) {
			const jsonData = this.readDatabase()
			return jsonData.data.find((doc) => {
				// Implementa lógica de búsqueda según tu consulta (query)
				return true
			})
		}

		async insert(doc) {
			const jsonData = this.readDatabase()
			const newDoc = { _uid: uuidv4(), ...doc }
			jsonData.data.push(newDoc)
			this.writeDatabase(jsonData)
			return newDoc
		}

		async update(query, updateQuery, options) {
			const jsonData = this.readDatabase()
			// Implementa la lógica de actualización según tu consulta (query) y updateQuery
			// Puedes usar map o forEach para actualizar los documentos en jsonData.data
			this.writeDatabase(jsonData)
			return {
				numAffected: 1,
				affectedDocuments: [
					/* lista de documentos afectados */
				],
				upsert: false,
			}
		}

		async remove(query, options) {
			const jsonData = this.readDatabase()
			if (query && query._uid) {
				// Eliminar por _uid si está presente en la consulta
				jsonData.data = jsonData.data.filter((doc) => doc._uid !== query._uid)
			} else {
				// Implementa la lógica de eliminación según tu consulta (query)
				// Puedes usar filter para mantener solo los documentos que no coincidan con la consulta
			}
			this.writeDatabase(jsonData)
			return /* número de documentos eliminados */
		}

		async clearCollection() {
			const jsonData = this.readDatabase()
			jsonData.data = []
			this.writeDatabase(jsonData)
			return {
				message: 'Collection cleared successfully',
			}
		}

		removeFolder() {
			// Elimina la carpeta y todos sus contenidos
			if (fs.existsSync(this.dbFolderPath)) {
				fs.rmdirSync(this.dbFolderPath, { recursive: true })
			}
			return
		}

		readDatabase() {
			const data = fs.readFileSync(this.dbPath, 'utf-8')
			return JSON.parse(data)
		}

		writeDatabase(jsonData) {
			fs.writeFileSync(this.dbPath, JSON.stringify(jsonData, null, 2))
		}
	}

	Vue.prototype.$rsNeDB = (databaseName) => new RsNeDB(databaseName)
}