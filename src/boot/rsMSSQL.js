// src/boot/rsMSSQL.js

const sql = require('mssql')
import env from '../utils/env'

export default async ({ Vue }) => {
	class RsDB {
		constructor(databaseName) {
			this.config = {
				user: env.database.user,
				password: env.database.password,
				server: env.database.server,
				database: databaseName,
				options: env.database.options || {},
			}
		}

		async executeQuery(query) {
			try {
				//console.log(this.config)
				const pool = await new sql.ConnectionPool(this.config).connect()
				const request = pool.request()

				const result = await request.query(query)

				await pool.close()

				return result.recordset
			} catch (error) {
				throw new Error(`Error executing SQL query: ${error.message}`)
			}
		}

		select(fields) {
			this.query = `SELECT ${fields}`
			return this
		}

		from(table) {
			this.query += ` FROM ${table}`
			return this
		}

		where(conditions) {
			this.query += ` WHERE ${conditions}`
			return this
		}

		orderBy(orderBy) {
			this.query += ` ORDER BY ${orderBy}`
			return this
		}

		limit(limit) {
			this.query += ` ORDER BY 1
OFFSET 0 ROWS
FETCH NEXT ${limit} ROWS ONLY`
			return this
		}

		insert(table) {
			this.query = `INSERT INTO ${table}`
			return this
		}

		fields(fieldsObj) {
			const fields = Object.keys(fieldsObj).join(', ')
			const values = Object.values(fieldsObj)
				.map((value) =>
					value === 'NEWID()' ? 'NEWID()' : typeof value === 'string' ? `'${value}'` : value
				)
				.join(', ')

			this.query += ` (${fields}) VALUES (${values})`

			return this
		}

		update(table) {
			this.query = `UPDATE ${table}`
			return this
		}

		set(fieldsObj) {
			const sets = Object.entries(fieldsObj)
				.map(([field, value]) => `${field} = ${typeof value === 'string' ? `'${value}'` : value}`)
				.join(', ')

			this.query += ` SET ${sets}`

			return this
		}

		delete(table) {
			this.query = `DELETE FROM ${table}`
			return this
		}

		value(value) {
			this.query += ` = ${typeof value === 'string' ? `'${value}'` : value}`
			return this
		}

		async execute() {
			sessionStorage.setItem('result', this.query)
			//console.log()
			return this.executeQuery(this.query)
		}
	}
	class localDB {
		constructor() {
			this.config = {
				user: env.localDB.user,
				password: env.localDB.password,
				server: env.localDB.server,
				database: env.localDB.table,
				options: env.localDB.options || {},
			}
		}

		async executeQuery(query) {
			try {
				//console.log(this.config)
				const pool = await new sql.ConnectionPool(this.config).connect()
				const request = pool.request()

				const result = await request.query(query)

				await pool.close()

				return result.recordset
			} catch (error) {
				throw new Error(`Error executing SQL query: ${error.message}`)
			}
		}

		select(fields) {
			this.query = `SELECT ${fields}`
			return this
		}

		from(table) {
			this.query += ` FROM ${table}`
			return this
		}

		where(conditions) {
			this.query += ` WHERE ${conditions}`
			return this
		}

		orderBy(orderBy) {
			this.query += ` ORDER BY ${orderBy}`
			return this
		}

		limit(limit) {
			this.query += ` ORDER BY 1
OFFSET 0 ROWS
FETCH NEXT ${limit} ROWS ONLY`
			return this
		}

		insert(table) {
			this.query = `INSERT INTO ${table}`
			return this
		}

		fields(fieldsObj) {
			const fields = Object.keys(fieldsObj).join(', ')
			const values = Object.values(fieldsObj)
				.map((value) =>
					value === 'NEWID()' ? 'NEWID()' : typeof value === 'string' ? `'${value}'` : value
				)
				.join(', ')

			this.query += ` (${fields}) VALUES (${values})`

			return this
		}

		update(table) {
			this.query = `UPDATE ${table}`
			return this
		}

		set(fieldsObj) {
			const sets = Object.entries(fieldsObj)
				.map(([field, value]) => `${field} = ${typeof value === 'string' ? `'${value}'` : value}`)
				.join(', ')

			this.query += ` SET ${sets}`

			return this
		}

		delete(table) {
			this.query = `DELETE FROM ${table}`
			return this
		}

		value(value) {
			this.query += ` = ${typeof value === 'string' ? `'${value}'` : value}`
			return this
		}

		async execute() {
			sessionStorage.setItem('result', this.query)
			//console.log()
			return this.executeQuery(this.query)
		}
	}

	// Agregar el objeto RsDB al prototipo de Vue
	Vue.prototype.$rsDB = (databaseName) => new RsDB(databaseName)
	Vue.prototype.$localDB = () => new localDB()
}
