const { exec } = require('child_process')
const PowerShell = require('powershell')
const path = require('path')

const currentDirectory = __dirname
const scriptsDirectory = path.join(currentDirectory, '..', 'scripts')

const CmdHelper = {
	executeScript: function (scriptPath, callback) {
		const powershellScriptPath = path.join(scriptsDirectory, `${scriptPath}.ps1`)
		exec(`cmd /c powershell -File ${powershellScriptPath}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`)
				return callback(error, null)
			}

			try {
				const result = JSON.parse(stdout)
				callback(null, result)
			} catch (parseError) {
				console.error('Error parsing output as JSON:', parseError.message)
				callback(parseError, null)
			}
		})
	},

	async executeScriptCode(code) {
		return new Promise(async (resolve) => {
			let ps = new PowerShell([code])
			let outputData = ''

			ps.on('output', (data) => {
				outputData += data
			})

			ps.on('error-output', (data) => {
				console.error(data)
				resolve(false)
			})

			ps.on('end', (code) => {
				try {
					//console.log(outputData)
					const result = JSON.parse(outputData)
					resolve(result)
				} catch (parseError) {
					console.error('Error parsing output as JSON:', parseError.message)
					resolve(false)
				}
			})

			ps.on('error', (err) => {
				console.error(err)
				resolve(false)
			})
		})
	},
}

export default ({ app, router, Vue }) => {
	Vue.prototype.$cmd = CmdHelper
}
