// src/boot/rsNeDB.js

import Datastore from 'nedb-promises'
import path from 'path'
import { app, remote } from 'electron'
import fs from 'fs'

export default async ({ Vue }) => {
	class RsNeDB {
		constructor(databaseName) {
			// Obtener la ruta del ejecutable de la aplicación
			const appPath = (app || remote.app).getAppPath()
			const dbFolderPath = path.join(path.dirname(appPath), 'data')
			const dbPath = path.join(dbFolderPath, `${databaseName}.db`)

			// Verificar si la carpeta existe, y crearla si no
			if (!fs.existsSync(dbFolderPath)) {
				fs.mkdirSync(dbFolderPath, { recursive: true })
			}

			// Verificar si el archivo de la base de datos existe, y crearlo si no
			if (!fs.existsSync(dbPath)) {
				fs.writeFileSync(dbPath, '') // Crear el archivo vacío
			}

			// Utilizar 'new' para crear una instancia de Datastore
			this.db = new Datastore({
				filename: dbPath,
				autoload: true,
			})
		}

		async find(query) {
			return this.db.find(query)
		}

		async findOne(query) {
			return this.db.findOne(query)
		}

		async insert(doc) {
			return this.db.insert(doc)
		}

		async update(query, updateQuery, options) {
			return this.db.update(query, updateQuery, options)
		}

		async remove(query, options) {
			return this.db.remove(query, options)
		}
	}

	// Agregar el objeto RsNeDB al prototipo de Vue
	Vue.prototype.$rsNeDB = (databaseName) => new RsNeDB(databaseName)
}
