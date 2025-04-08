import { components } from 'src/scripts'

const { exec } = require('child_process')
const PowerShell = require('powershell')
const path = require('path')
const fs = require('fs')

const currentDirectory = __dirname
const scriptsDirectory = path.join(currentDirectory, '..', 'scripts')
async function checkComponentsPresence(fileContent) {
	// Definimos los componentes a buscar y sus patrones asociados
	const components = [
		{ name: 'Fingerprint', pattern: /Fingerprint/i },
		{ name: 'Backlight', pattern: /Backlit keyboard|Keyboard Backlight/i },
		{ name: 'TouchScreen', pattern: /Touch Screen|Touch Device/i },
		{ name: 'WWAN', pattern: /WWAN|Mobile Network Device|GPS Combo Device/i },
		{ name: 'Privacy', pattern: /Privacy/i },
		{ name: 'SmartCard', pattern: /Smart Card/i },
		{ name: 'NFC', pattern: /NFC/i },
		{ name: 'Webcam', pattern: /Camera/i },
		{ name: 'Bluetooth', pattern: /Bluetooth/i },
		{ name: 'Audio', pattern: /Audio/i },
		{ name: 'Microphone', pattern: /Microphone/i },
		{ name: 'WLAN', pattern: /WLAN|Wireless Network/i },
	]

	// Creamos un objeto para almacenar los resultados
	const result = {}

	// Iteramos sobre cada componente y verificamos su presencia
	components.forEach((component) => {
		if (component.name === 'Privacy') {
			// Verificar excepciones para "Camera Privacy"
			const cameraPrivacyPattern = /Camera Privacy/i
			result[component.name] = cameraPrivacyPattern.test(fileContent)
				? String('NO')
				: component.pattern.test(fileContent)
				? String('YES')
				: String('NO')
		} else {
			result[component.name] = component.pattern.test(fileContent) ? String('YES') : String('NO')
		}
	})

	return result
}
async function checkItems(items, documentText) {
	function capitalizeAndRemoveSpaces(str) {
		return str.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, '')
	}

	// Define los conjuntos de palabras clave y cómo deben evaluarse
	const keywordSets = [
		{ enableWord: 'Unlock', disableWord: 'Lock', enableResult: 'NO', disableResult: 'YES' },
		{ enableWord: 'Enable', disableWord: 'Disable', enableResult: 'YES', disableResult: 'NO' },
		{ enableWord: 'Yes', disableWord: 'No', enableResult: 'YES', disableResult: 'NO' },
	]

	const result = {}

	for (const item of items) {
		let transformedItem = capitalizeAndRemoveSpaces(item)
		result[transformedItem] = null // Inicializa el resultado con 'null' para el caso de no coincidencia

		// Iterar sobre cada conjunto de palabras clave para verificar coincidencias
		for (const { enableWord, disableWord, enableResult, disableResult } of keywordSets) {
			// Regex para capturar el valor relevante en la línea siguiente a la clave
			const regex = new RegExp(`${item}.*\\r?\\n\\s*(\\*?)(${enableWord}|${disableWord})`, 'i')
			const match = documentText.match(regex)

			if (match) {
				const hasAsterisk = match[1] === '*'
				const command = match[2].toLowerCase()

				// Aplicar lógica basada en si el comando está habilitado o deshabilitado y la presencia del asterisco
				if (
					(command === enableWord.toLowerCase() && hasAsterisk) ||
					(command === disableWord.toLowerCase() && !hasAsterisk)
				) {
					result[transformedItem] = enableResult
				} else {
					result[transformedItem] = disableResult
				}
				break // Salir del bucle si se encuentra una coincidencia
			}
		}
	}

	return result
}

// Valores de prueba
const items = [
	'Lock BIOS',
	'Fingerprint Reset',
	'Smart Card',
	'Bluetooth',
	'Wireless Network',
	'Lock Wireless',
	'Internal Speakers',
	'Microphone',
	'Integrated Camera',
	'Fingerprint Device',
	'Touch Device',
	'OS Recovery',
	'Programming Mode',
	'NumLock',
	'Keys mapped',
	'Backlit',
	'Mobile Network',
	'Headphone',
	'NFC',
	'Platform Cycle',
]

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
		callback,
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
			// Envolver el código en un script que solicite elevación de privilegios
			const elevatedCode = `
# Verificar si el script se está ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    # Si no es administrador, relanzar el script con privilegios elevados
    $tempFile = [System.IO.Path]::GetTempFileName() + '.ps1'
    $code | Out-File -FilePath $tempFile -Encoding UTF8
    $arguments = '-NoProfile -ExecutionPolicy Bypass -File "' + $tempFile + '"'
    Start-Process powershell -Verb RunAs -ArgumentList $arguments
    Remove-Item $tempFile -Force
    exit
}

# Si ya es administrador, ejecutar el código original
${code}
`
			let ps = new PowerShell([elevatedCode])
			let outputData = ''
			let errorData = ''

			ps.on('output', (data) => {
				outputData += data
			})

			ps.on('error-output', (data) => {
				errorData += data
				console.error('PowerShell Error Output:', data)
			})

			ps.on('end', (code) => {
				try {
					if (errorData) {
						console.error('PowerShell execution completed with errors:', errorData)
					}
					const result = outputData.includes('{') ? JSON.parse(outputData) : outputData
					resolve(result)
				} catch (parseError) {
					console.error('Error parsing PowerShell output as JSON:', parseError.message)
					console.error('Raw output:', outputData)
					resolve(false)
				}
			})

			ps.on('error', (err) => {
				console.error('PowerShell execution error:', err)
				console.error('Error details:', err.message)
				resolve(false)
			})
		})
	},
	savePS: async (params) => {
		return new Promise(async (resolve) => {
			const fileName = path.basename(params.filePath)
			const code = `
      # Parámetros
$authorizationToken = "Bearer ${params.token}"
$tenant = "${params.tenant}"
$filePath = '${params.filePath}'

# Verificar si el archivo existe y se puede acceder
if (Test-Path $filePath -PathType Leaf) {
    # Verificar permisos de lectura para el archivo
    try {
        $fileContent = Get-Content $filePath -Raw -ErrorAction Stop

        # URL
        $url = '${params.apiUrl}'

        # Encabezados
        $headers = @{
            "User-Agent"    = "insomnia/2023.5.8"
            "tenant"        = $tenant
            "Authorization" = $authorizationToken
        }

        # Construir el cuerpo de la solicitud
        $boundary = [System.Guid]::NewGuid().ToString()
        $CRLF = "\`r\`n"
        $bodyLines = @()
        $bodyLines += "--$boundary"
        $bodyLines += 'Content-Disposition: form-data; name=""; filename="${fileName}"'
        $bodyLines += 'Content-Type: text/plain'
        $bodyLines += ''
        $bodyLines += $fileContent
        $bodyLines += "--$boundary--$CRLF"

        $body = $bodyLines -join $CRLF

        # Realizar la Solicitud con Invoke-RestMethod
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -ContentType "multipart/form-data; boundary=$boundary"
        #Write-Host $response
        $response | ConvertTo-Json
    } catch {
        Write-Host "Error al leer el archivo: $_"
    }
} else {
    Write-Host "El archivo no existe o no se puede acceder."
}
    `
			//console.log(code)

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
					const result = JSON.parse(outputData)
					resolve(result._isSuccess)
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
	saveImg: async (params) => {
		return new Promise(async (resolve) => {
			const fileName = path.basename(params.filePath)
			const code = `
      # Parámetros
$authorizationToken = "Bearer ${params.token}"
$tenant = "${params.tenant}"
$filePath = '${params.filePath}'
$fileName = '${fileName}'  # Asegúrate de tener esta variable definida

# Verificar si el archivo existe y se puede acceder
if (Test-Path $filePath -PathType Leaf) {
    # Verificar permisos de lectura para el archivo
    try {
        $fileContent = [System.IO.File]::ReadAllBytes($filePath)

        # URL
        $url = '${params.apiUrl}'

        # Encabezados
        $headers = @{
            "User-Agent"    = "insomnia/2023.5.8"
            "tenant"        = $tenant
            "Authorization" = $authorizationToken
        }

        # Construir el cuerpo de la solicitud
        $boundary = [System.Guid]::NewGuid().ToString()
        $CRLF = "\`r\`n"
        $bodyLines = @()
        $bodyLines += "--$boundary"
        $bodyLines += 'Content-Disposition: form-data; name="file"; filename="${fileName}"'
        $bodyLines += 'Content-Type: image/jpeg'  # Ajusta el tipo de contenido según el tipo de archivo
        $bodyLines += ''
        $bodyLines += [System.Text.Encoding]::Default.GetString($fileContent)
        $bodyLines += "--$boundary--$CRLF"

        $body = [System.Text.Encoding]::Default.GetBytes($bodyLines -join $CRLF)

        # Realizar la Solicitud con Invoke-RestMethod
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -ContentType "multipart/form-data; boundary=$boundary"
        #Write-Host $response
        $response | ConvertTo-Json
    } catch {
        Write-Host "Error al leer el archivo: $_"
    }
} else {
    Write-Host "El archivo no existe o no se puede acceder."
}
`
			//console.log(code)

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
					const result = JSON.parse(outputData)
					resolve(result._isSuccess)
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
	getDx: async (params) => {
		return new Promise(async (resolve) => {
			function getGraphicsInfo(dxdiagContent) {
				// Buscar el patrón para el nombre de la tarjeta gráfica
				const cardNamePattern = /Card name: (.+)/g
				const dedicatedMemoryPattern = /Dedicated Memory: (.+)/g

				let match
				const graphicsInfoArray = []

				// Buscar todas las coincidencias para el nombre de la tarjeta gráfica
				while ((match = cardNamePattern.exec(dxdiagContent)) !== null) {
					const cardName = match[1].trim()

					// Buscar la coincidencia correspondiente para la memoria dedicada
					const dedicatedMemoryMatch = dedicatedMemoryPattern.exec(dxdiagContent)
					const dedicatedMemoryString = dedicatedMemoryMatch
						? dedicatedMemoryMatch[1].trim()
						: 'No se encontró'

					// Convertir la memoria dedicada a gigabytes o megabytes y agregar el sufijo correspondiente
					let dedicatedMemoryValue
					if (dedicatedMemoryString !== 'No se encontró') {
						const memoryInMB = parseFloat(dedicatedMemoryString.replace(' MB', ''))
						dedicatedMemoryValue =
							memoryInMB >= 1024 ? `${Math.round(memoryInMB / 1024)} GB` : `${memoryInMB} MB`
					} else {
						dedicatedMemoryValue = 'No se encontró'
					}

					// Agregar la información al array
					graphicsInfoArray.push({
						Description: cardName,
						AdapterRAM: dedicatedMemoryValue,
					})
				}

				return graphicsInfoArray
			}
			var textFilePath = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'LogDesktops')
			if (!fs.existsSync(textFilePath)) {
				// La carpeta no existe, la creamos
				fs.mkdirSync(textFilePath, { recursive: true })
			}

			textFilePath = path.join(textFilePath, params.Serial)
			const code = `
      $fileName = "${textFilePath}.txt"
dxdiag /t $fileName

# Esperar hasta que el archivo exista
while (-not (Test-Path $fileName)) {
    Start-Sleep -Seconds 1
}
$contenido = Get-Content -Path $fileName -Raw

# Mostrar el contenido en formato JSON en la consola
$contenido
`
			//console.log(code)

			let ps = new PowerShell([code])
			let outputData = ''

			ps.on('output', (data) => {
				//console.log(outputData.length)
				outputData += data
			})

			ps.on('error-output', (data) => {
				console.error(data)
				resolve(false)
			})

			ps.on('end', (code) => {
				try {
					//console.log(outputData.length)
					let result = getGraphicsInfo(outputData)
					//console.log(result)
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
	update: async () => {
		return new Promise(async (resolve) => {
			const code = `
$nombreProceso = "update"
$rutaOrigen = "${path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'update')}"
$rutaDestino = "${path.join(process.cwd().split(path.sep)[0] + path.sep)}"
$archivoDestino = Join-Path -Path $rutaDestino -ChildPath "$nombreProceso.exe"

# Verificar si el archivo de destino ya existe y eliminarlo si es así
if (Test-Path $archivoDestino) {
    Write-Host "El archivo $archivoDestino ya existe. Eliminándolo..."
    Remove-Item -Path $archivoDestino -Force
}

# Copiar el archivo desde $rutaOrigen a $rutaDestino
Copy-Item -Path "$rutaOrigen\\$nombreProceso.exe" -Destination $rutaDestino -Recurse -Force

# Verificar si la copia fue exitosa antes de ejecutar el siguiente proceso
if (Test-Path $archivoDestino) {
    Write-Host "Copia de update.exe a $rutaDestino exitosa."

    # Ejecutar el archivo $nombreProceso.exe en modo administrador
    Start-Process -FilePath "$rutaDestino\\$nombreProceso.exe" -Verb RunAs
} else {
    Write-Host "Error al copiar update.exe a $rutaDestino"
}
`

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
					const result = outputData
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
	logout: async () => {
		return new Promise(async (resolve) => {
			const code = `
$file = "user"
$rutaOrigen = "${path.join(process.cwd().split(path.sep)[0], 'resources', 'data', 'user.json')}"
$rutaDestino = "${path.join(process.cwd().split(path.sep)[0], 'resources', 'data')}"
# Verificar si el archivo de destino ya existe y eliminarlo si es así
$archivoDestino = Join-Path -Path $rutaDestino -ChildPath "$file.json"

if (Test-Path $archivoDestino) {
    Write-Host "El archivo $archivoDestino ya existe. Eliminándolo..."
    Remove-Item -Path $rutaDestino -Recurse -Force
}
`

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
					const result = JSON.parse(outputData)
					resolve(result._isSuccess)
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
	biosData: async () => {
		return new Promise(async (resolve, reject) => {
			// Construir la ruta hacia la herramienta y el archivo de configuración
			const toolsPath = path.join(process.cwd().split(path.sep)[0] + path.sep, '..', 'Tools')
			const myApp = path.join(toolsPath, 'Bios.exe')
			const configFile = path.join(toolsPath, 'config.txt')

			// Argumento para el comando Bios.exe, incluyendo la ruta completa al archivo de configuración
			const argument = `/GetConfig:"${configFile}"`

			// Comando completo para PowerShell
			const psCommand = `& '${myApp}' ${argument}`

			// Crear una nueva instancia de PowerShell
			let ps = new PowerShell(psCommand)

			// Escuchar los outputs de la consola
			ps.on('output', (data) => {
				//console.log(data)
			})

			// Escuchar si hay errores
			ps.on('error', (err) => {
				console.error('Error en PowerShell:', err)
			})

			// Escuchar cuando el proceso termina
			ps.on('end', async (code) => {
				try {
					// Esperar a que se cree el archivo antes de leerlo
					let checkInterval = setInterval(() => {
						if (fs.existsSync(configFile)) {
							clearInterval(checkInterval)
							fs.readFile(configFile, 'utf8', async (err, data) => {
								if (err) {
									console.error('Error al leer el archivo de configuración:', err)
									reject(err)
								}
								let re = await checkItems(items, data)
								let comp = await checkComponentsPresence(data)
								re = { ...re, components: comp }
								resolve(re)
								//console.log('Contenido de config.txt:', data);
							})
						}
					}, 1000) // Revisa cada segundo si el archivo ya está disponible
				} catch (parseError) {
					console.error('Error parsing output as JSON:', parseError.message)
					resolve(false)
				}
			})
		})
	},
}

export default ({ app, router, Vue }) => {
	Vue.prototype.$cmd = CmdHelper
}
