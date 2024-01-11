// src/boot/rsNeDB.js

import path from 'path'
import { app, remote } from 'electron'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export default async ({ Vue }) => {
	class RsNeDB {
		constructor(databaseName) {
			const appPath = (app || remote.app).getAppPath()
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
