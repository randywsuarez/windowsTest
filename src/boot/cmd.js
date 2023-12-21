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
	execParam: function runPowerShellScript(
		scriptPath,
		filePath,
		serialNumber,
		employeeID,
		fileType,
		token,
		callback
	) {
		const powershellScriptPath = path.join(scriptsDirectory, `${scriptPath}.ps1`)

		// Construir el comando de PowerShell con los parámetros
		const command = `cmd /c powershell -File ${powershellScriptPath} -FilePath "${filePath}" -SerialNumber "${serialNumber}" -EmployeeID "${employeeID}" -FileType "${fileType}" -token "${token}"`

		exec(command, (error, stdout, stderr) => {
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

	executeScriptCode: async (code) => {
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
					console.log(outputData)
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

	savePS: async (params) => {
		return new Promise(async (resolve) => {
			const fileName = path.basename(params.filePath)
			const code = `
      $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
      $headers.Add("tenant", "${params.tenant}")
      $headers.Add("Authorization", "Bearer ${params.token}")
      $headers.Add("Cookie", "ARRAffinity=9392b2366e7e292b2d3d255a990371852c7f338d552708093b1d04da72aa9ba2; ARRAffinitySameSite=9392b2366e7e292b2d3d255a990371852c7f338d552708093b1d04da72aa9ba2")

      $multipartContent = [System.Net.Http.MultipartFormDataContent]::new()
      $multipartFile = '${params.filePath}'
      $FileStream = [System.IO.FileStream]::new($multipartFile, [System.IO.FileMode]::Open)
      $fileHeader = [System.Net.Http.Headers.ContentDispositionHeaderValue]::new("form-data")
      $fileHeader.Name = ""
      $fileHeader.FileName = "${fileName}"
      $fileContent = [System.Net.Http.StreamContent]::new($FileStream)
      $fileContent.Headers.ContentDisposition = $fileHeader
      $multipartContent.Add($fileContent)

      $body = $multipartContent

      $response = Invoke-RestMethod '${params.apiUrl}' -Method 'POST' -Headers $headers -Body $body
      $response | ConvertTo-Json
    `
			console.log(code)

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
					console.log(outputData)
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
