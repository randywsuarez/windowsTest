const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const os = require('os')

// Función simplificada para obtener rutas relativas al directorio de ejecución
function getAppPath(...segments) {
  // Obtener directorio de ejecución actual
  const currentDir = process.cwd();
  console.log('Executing from:', currentDir);
  
  // Resolver ruta relativa a este directorio
  const resolvedPath = path.join(currentDir, ...segments);
  console.log(`Resolved path: ${resolvedPath}`);
  
  return resolvedPath;
}

// Función para crear directorios si no existen
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

// Obtener el directorio de scripts relativo al directorio actual
const scriptsDirectory = getAppPath('scripts');

// Función para ejecutar scripts mediante archivo temporal con reintentos
function runScriptViaTempWithRetry(scriptContent, maxRetries = 3) {
  return new Promise(async (resolve, reject) => {
    let retries = 0;
    
    const executeWithRetry = async () => {
      try {
        // Crear un identificador único para el archivo temporal
        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const tmpFileName = `ps_script_${timestamp}_${randomStr}.ps1`;
        const tmpFilePath = path.join(os.tmpdir(), tmpFileName);
        
        console.log(`Creando archivo temporal: ${tmpFilePath}`);
        
        // Escribir el script en el archivo temporal
        fs.writeFileSync(tmpFilePath, scriptContent, 'utf8');
        
        // Verificar que el archivo exista y sea accesible
        if (!fs.existsSync(tmpFilePath)) {
          throw new Error(`No se pudo crear el archivo temporal en: ${tmpFilePath}`);
        }
        
        // Ejecutar el comando PowerShell
        return new Promise((resolveExec, rejectExec) => {
          const command = `powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "${tmpFilePath}"`;
          
          console.log(`Ejecutando comando: ${command}`);
          
          exec(command, (error, stdout, stderr) => {
            console.log('Comando PowerShell ejecutado, resultado:', 
              error ? `ERROR: ${error.message}` : 'Éxito');
            
            // Intentar limpiar el archivo temporal después de un breve retraso
            setTimeout(() => {
              try {
                if (fs.existsSync(tmpFilePath)) {
                  fs.unlinkSync(tmpFilePath);
                  console.log(`Archivo temporal eliminado: ${tmpFilePath}`);
                }
              } catch (e) {
                console.warn('No se pudo eliminar archivo temporal:', e.message);
              }
            }, 200);
            
            if (error) {
              rejectExec(error);
              return;
            }
            
            if (stderr && stderr.trim() !== '') {
              rejectExec(new Error(stderr.trim()));
              return;
            }
            
            resolveExec(stdout.trim());
          });
        });
      } catch (err) {
        throw err;
      }
    };
    
    // Intenta ejecutar con reintentos
    while (retries <= maxRetries) {
      try {
        const result = await executeWithRetry();
        return resolve(result);
      } catch (err) {
        retries++;
        console.error(`Error en intento ${retries}/${maxRetries}:`, err.message);
        
        if (retries > maxRetries) {
          console.error(`Error después de ${maxRetries} intentos:`, err);
          return reject(err);
        }
        
        // Esperar un tiempo antes de reintentar (tiempo exponencial)
        const waitTime = Math.pow(2, retries) * 500; // 1s, 2s, 4s
        console.log(`Reintento ${retries} en ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  });
}

// Funciones existentes para el procesamiento de datos BIOS
async function checkComponentsPresence(fileContent) {
  // Definir componentes a buscar y sus patrones asociados
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

  // Crear un objeto para almacenar los resultados
  const result = {}

  // Iterar sobre cada componente y verificar su presencia
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

  // Definir conjuntos de palabras clave y cómo deben evaluarse
  const keywordSets = [
    { enableWord: 'Unlock', disableWord: 'Lock', enableResult: 'NO', disableResult: 'YES' },
    { enableWord: 'Enable', disableWord: 'Disable', enableResult: 'YES', disableResult: 'NO' },
    { enableWord: 'Yes', disableWord: 'No', enableResult: 'YES', disableResult: 'NO' },
  ]

  const result = {}

  for (const item of items) {
    let transformedItem = capitalizeAndRemoveSpaces(item)
    result[transformedItem] = null // Inicializar resultado con 'null' para no coincidencia

    // Iterar sobre cada conjunto de palabras clave para buscar coincidencias
    for (const { enableWord, disableWord, enableResult, disableResult } of keywordSets) {
      // Regex para capturar el valor relevante en la línea siguiente a la clave
      const regex = new RegExp(`${item}.*\\r?\\n\\s*(\\*?)(${enableWord}|${disableWord})`, 'i')
      const match = documentText.match(regex)

      if (match) {
        const hasAsterisk = match[1] === '*'
        const command = match[2].toLowerCase()

        // Aplicar lógica basada en si el comando está habilitado o deshabilitado y la presencia de asterisco
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

// Definición de CmdHelper con métodos mejorados
const CmdHelper = {
  executeScript: function (scriptPath, callback) {
    const powershellScriptPath = getAppPath('scripts', `${scriptPath}.ps1`);
    
    // Verificar que el archivo exista
    if (!fs.existsSync(powershellScriptPath)) {
      return callback(new Error(`Script no encontrado: ${powershellScriptPath}`), null);
    }
    
    // Ejecutar directamente con exec
    exec(`powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "${powershellScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return callback(error, null);
      }

      try {
        const result = JSON.parse(stdout);
        callback(null, result);
      } catch (parseError) {
        console.error('Error parsing output as JSON:', parseError.message);
        callback(parseError, null);
      }
    });
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
    const powershellScriptPath = getAppPath('scripts', `${scriptPath}.ps1`);

    // Verificar que el archivo exista
    if (!fs.existsSync(powershellScriptPath)) {
      return callback(new Error(`Script no encontrado: ${powershellScriptPath}`), null);
    }
    
    // Construir comando PowerShell con parámetros
    const command = `powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "${powershellScriptPath}" -FilePath "${filePath}" -SerialNumber "${serialNumber}" -EmployeeID "${employeeID}" -FileType "${fileType}" -token "${token}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return callback(error, null);
      }

      try {
        const result = JSON.parse(stdout);
        callback(null, result);
      } catch (parseError) {
        console.error('Error parsing output as JSON:', parseError.message);
        callback(parseError, null);
      }
    });
  },

  executeScriptCode: async (code) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Ejecutando script PowerShell');
        
        // Ejecutar el script mediante archivo temporal con reintentos
        const output = await runScriptViaTempWithRetry(code);
        
        try {
          // Intentar parsear como JSON
          const jsonResult = JSON.parse(output);
          resolve(jsonResult);
        } catch (e) {
          // Si no es JSON, devolver el texto
          resolve(output);
        }
      } catch (error) {
        console.error('Error ejecutando script:', error);
        reject(error);
      }
    });
  },
  
  savePS: async (params) => {
    return new Promise(async (resolve) => {
      try {
        const fileName = path.basename(params.filePath);
        
        const code = `
# Parameters
$authorizationToken = "Bearer ${params.token}"
$tenant = "${params.tenant}"
$filePath = '${params.filePath}'

# Check if the file exists and can be accessed
if (Test-Path $filePath -PathType Leaf) {
    # Check read permissions for the file
    try {
        $fileContent = Get-Content $filePath -Raw -ErrorAction Stop

        # URL
        $url = '${params.apiUrl}'

        # Headers
        $headers = @{
            "User-Agent"    = "insomnia/2023.5.8"
            "tenant"        = $tenant
            "Authorization" = $authorizationToken
        }

        # Build request body
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

        # Make the Request with Invoke-RestMethod
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -ContentType "multipart/form-data; boundary=$boundary"
        $response | ConvertTo-Json
    } catch {
        Write-Output "{'error': 'Error reading file: $($_.Exception.Message)'}" 
    }
} else {
    Write-Output "{'error': 'The file does not exist or cannot be accessed.'}"
}
        `;
        
        // Usar la función mejorada con reintentos
        const output = await runScriptViaTempWithRetry(code);
        
        try {
          const result = JSON.parse(output);
          resolve(result._isSuccess);
        } catch (parseError) {
          console.error('Error parsing output as JSON:', parseError.message);
          resolve(false);
        }
      } catch (error) {
        console.error('Error ejecutando script:', error);
        resolve(false);
      }
    });
  },
  
  saveImg: async (params) => {
    return new Promise(async (resolve) => {
      try {
        const fileName = path.basename(params.filePath);
        
        const code = `
# Parameters
$authorizationToken = "Bearer ${params.token}"
$tenant = "${params.tenant}"
$filePath = '${params.filePath}'
$fileName = '${fileName}'

# Check if the file exists and can be accessed
if (Test-Path $filePath -PathType Leaf) {
    # Check read permissions for the file
    try {
        $fileContent = [System.IO.File]::ReadAllBytes($filePath)

        # URL
        $url = '${params.apiUrl}'

        # Headers
        $headers = @{
            "User-Agent"    = "insomnia/2023.5.8"
            "tenant"        = $tenant
            "Authorization" = $authorizationToken
        }

        # Build request body
        $boundary = [System.Guid]::NewGuid().ToString()
        $CRLF = "\`r\`n"
        $bodyLines = @()
        $bodyLines += "--$boundary"
        $bodyLines += 'Content-Disposition: form-data; name="file"; filename="${fileName}"'
        $bodyLines += 'Content-Type: image/jpeg'  # Adjust content type according to file type
        $bodyLines += ''
        $bodyLines += [System.Text.Encoding]::Default.GetString($fileContent)
        $bodyLines += "--$boundary--$CRLF"

        $body = [System.Text.Encoding]::Default.GetBytes($bodyLines -join $CRLF)

        # Make the Request with Invoke-RestMethod
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -ContentType "multipart/form-data; boundary=$boundary"
        $response | ConvertTo-Json
    } catch {
        Write-Output "{'error': 'Error reading file: $($_.Exception.Message)'}"
    }
} else {
    Write-Output "{'error': 'The file does not exist or cannot be accessed.'}"
}
        `;
        
        // Usar la función mejorada con reintentos
        const output = await runScriptViaTempWithRetry(code);
        
        try {
          const result = JSON.parse(output);
          resolve(result._isSuccess);
        } catch (parseError) {
          console.error('Error parsing output as JSON:', parseError.message);
          resolve(false);
        }
      } catch (error) {
        console.error('Error ejecutando script:', error);
        resolve(false);
      }
    });
  },
  
  getDx: async (params) => {
    return new Promise(async (resolve) => {
      try {
        function getGraphicsInfo(dxdiagContent) {
          // Buscar el patrón para el nombre de la tarjeta gráfica
          const cardNamePattern = /Card name: (.+)/g;
          const dedicatedMemoryPattern = /Dedicated Memory: (.+)/g;
  
          let match;
          const graphicsInfoArray = [];
  
          // Encontrar todas las coincidencias para el nombre de la tarjeta gráfica
          while ((match = cardNamePattern.exec(dxdiagContent)) !== null) {
            const cardName = match[1].trim();
  
            // Encontrar la coincidencia correspondiente para la memoria dedicada
            const dedicatedMemoryMatch = dedicatedMemoryPattern.exec(dxdiagContent);
            const dedicatedMemoryString = dedicatedMemoryMatch
              ? dedicatedMemoryMatch[1].trim()
              : 'Not found';
  
            // Convertir memoria dedicada a gigabytes o megabytes y agregar el sufijo apropiado
            let dedicatedMemoryValue;
            if (dedicatedMemoryString !== 'Not found') {
              const memoryInMB = parseFloat(dedicatedMemoryString.replace(' MB', ''));
              dedicatedMemoryValue =
                memoryInMB >= 1024 ? `${Math.round(memoryInMB / 1024)} GB` : `${memoryInMB} MB`;
            } else {
              dedicatedMemoryValue = 'Not found';
            }
  
            // Agregar la información al array
            graphicsInfoArray.push({
              Description: cardName,
              AdapterRAM: dedicatedMemoryValue,
            });
          }
  
          return graphicsInfoArray;
        }
        
        // Usar ruta dinámica basada en el directorio actual
        const logFolder = 'LogDesktops';
        let logBasePath = getAppPath(logFolder);
        
        // Crear carpeta si no existe
        ensureDirectoryExists(logBasePath);
        
        const textFilePath = path.join(logBasePath, params.Serial);
        
        const code = `
$fileName = "${textFilePath}.txt"
dxdiag /t $fileName

# Esperar hasta que el archivo exista
$retryCount = 0
$maxRetries = 10
while (-not (Test-Path $fileName) -and $retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 1
    $retryCount++
}

if (Test-Path $fileName) {
    $content = Get-Content -Path $fileName -Raw
    Write-Output $content
} else {
    Write-Output "{'error': 'No se pudo generar el archivo dxdiag'}"
}
        `;
        
        // Usar la función mejorada con reintentos
        const output = await runScriptViaTempWithRetry(code);
        
        try {
          let result = getGraphicsInfo(output);
          resolve(result);
        } catch (parseError) {
          console.error('Error parsing output:', parseError.message);
          resolve(false);
        }
      } catch (error) {
        console.error('Error ejecutando script:', error);
        resolve(false);
      }
    });
  },
  
  update: async () => {
    return new Promise(async (resolve) => {
      try {
        // Usar rutas dinámicas basadas en el directorio actual
        const updateSourceDir = getAppPath('update');
        const updateDestDir = process.cwd();
        
        const code = `
$processName = "update"
$sourcePath = "${updateSourceDir}"
$destinationPath = "${updateDestDir}"
$destinationFile = Join-Path -Path $destinationPath -ChildPath "$processName.exe"

# Verificar si el archivo de destino ya existe y eliminarlo si lo hace
if (Test-Path $destinationFile) {
    Write-Host "The file $destinationFile already exists. Deleting it..."
    Remove-Item -Path $destinationFile -Force
}

# Copiar el archivo desde $sourcePath a $destinationPath
Copy-Item -Path "$sourcePath\\$processName.exe" -Destination $destinationPath -Recurse -Force

# Verificar si la copia fue exitosa antes de ejecutar el siguiente proceso
if (Test-Path $destinationFile) {
    Write-Host "Successfully copied update.exe to $destinationPath."

    # Ejecutar el archivo $processName.exe en modo administrador
    Start-Process -FilePath "$destinationPath\\$processName.exe" -Verb RunAs -WindowStyle Hidden
} else {
    Write-Host "Error copying update.exe to $destinationPath"
}
        `;
        
        // Usar la función mejorada con reintentos
        const output = await runScriptViaTempWithRetry(code);
        resolve(output);
      } catch (error) {
        console.error('Error ejecutando script:', error);
        resolve(false);
      }
    });
  },
  
  logout: async () => {
    return new Promise(async (resolve) => {
      try {
        // Usar ruta dinámica basada en el directorio actual
        const resourcesDataPath = getAppPath('resources', 'data');
        
        const code = `
$file = "user"
$sourcePath = "${path.join(resourcesDataPath, 'user.json')}"
$destinationPath = "${resourcesDataPath}"
# Verificar si el archivo de destino ya existe y eliminarlo si lo hace
$destinationFile = Join-Path -Path $destinationPath -ChildPath "$file.json"

if (Test-Path $destinationFile) {
    Write-Host "The file $destinationFile already exists. Deleting it..."
    Remove-Item -Path $destinationPath -Recurse -Force
    Write-Output '{"_isSuccess": true}'
} else {
    Write-Output '{"_isSuccess": false}'
}
        `;
        
        // Usar la función mejorada con reintentos
        const output = await runScriptViaTempWithRetry(code);
        
        try {
          const result = JSON.parse(output);
          resolve(result._isSuccess);
        } catch (parseError) {
          console.error('Error parsing output as JSON:', parseError.message);
          resolve(false);
        }
      } catch (error) {
        console.error('Error ejecutando script:', error);
        resolve(false);
      }
    });
  },
  
  // Método específicamente actualizado para biosData
  biosData: async (serial) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Usar rutas dinámicas basadas en el directorio actual
        const toolsPath = getAppPath('Tools');
        console.log(`Directorio Tools: ${toolsPath}`);
        
        // Asegurarse de que el directorio Tools existe
        ensureDirectoryExists(toolsPath);
        
        const biosExePath = path.join(toolsPath, 'Bios.exe');
        console.log(`Ruta de Bios.exe: ${biosExePath}`);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(biosExePath)) {
          console.error(`ERROR: Bios.exe no existe en ${biosExePath}`);
          return reject(new Error(`Bios.exe no encontrado en ${biosExePath}`));
        }
        
        // Generar un nombre de archivo único con serial y marca de tiempo
        const timestamp = new Date().getTime();
        const configFile = path.join(toolsPath, `${serial}-bios-${timestamp}.txt`);
        
        console.log(`Archivo de configuración se guardará en: ${configFile}`);
        
        // Crear el script de PowerShell con las rutas correctas
        const code = `
# Verificar si Bios.exe existe
if (Test-Path "${biosExePath}") {
    Write-Host "Bios.exe encontrado en: ${biosExePath}"
} else {
    Write-Host "ERROR: Bios.exe NO ENCONTRADO en: ${biosExePath}"
    exit 1
}

# Ejecutar Bios.exe con la ruta completa
& "${biosExePath}" /GetConfig:"${configFile}"

# Esperar hasta que el archivo exista
$retryCount = 0
$maxRetries = 10
while (-not (Test-Path "${configFile}") -and $retryCount -lt $maxRetries) {
    Write-Host "Esperando a que se genere el archivo... Intento $retryCount de $maxRetries"
    Start-Sleep -Seconds 1
    $retryCount++
}

if (Test-Path "${configFile}") {
    $content = Get-Content -Path "${configFile}" -Raw
    Write-Output $content
} else {
    Write-Error "Error: No se pudo generar el archivo de configuración después de $maxRetries intentos"
    exit 1
}
        `;
        
        // Usar la función mejorada con reintentos y log detallado
        console.log('Iniciando ejecución de Bios.exe...');
        const output = await runScriptViaTempWithRetry(code);
        console.log('Bios.exe ejecutado, procesando resultado...');
        
        // Procesar datos de BIOS
        try {
          const itemsResult = await checkItems(items, output);
          const componentsResult = await checkComponentsPresence(output);
          
          const result = {
            ...itemsResult,
            components: componentsResult,
            txt: output // Incluir el texto completo
          };
          
          // Eliminar el archivo de configuración si existe
          if (fs.existsSync(configFile)) {
            fs.unlink(configFile, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });
          }
          
          resolve(result);
        } catch (err) {
          console.error('Error procesando datos de BIOS:', err);
          reject(err);
        }
      } catch (error) {
        console.error('Error ejecutando script de BIOS:', error);
        reject(error);
      }
    });
  },
}

// Exportación para uso en Quasar/Vue
export default ({ app, router, Vue }) => {
  Vue.prototype.$cmd = CmdHelper
}