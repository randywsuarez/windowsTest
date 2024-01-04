export default `
# Función para ejecutar comandos y manejar errores
function Ejecutar-Comando {
    param (
        [string]$comando
    )

    try {
        Invoke-Expression -Command $comando -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Inicializar el objeto JSON
$resultadoJSON = @{
    result = $null
    data = $null
}

# Configurar el servicio Windows Time (w32time) para que inicie automáticamente
$resultadoJSON.result = Ejecutar-Comando "Set-Service -Name w32time -StartupType Automatic"

# Reiniciar el servicio Windows Time
$resultadoJSON.result = $resultadoJSON.result -and (Ejecutar-Comando "Restart-Service w32time")

# Sincronizar la hora con un servidor de tiempo externo (por ejemplo, time.windows.com)
$resultadoJSON.result = $resultadoJSON.result -and (Ejecutar-Comando 'w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /reliable:YES /update')

# Reiniciar el servicio Windows Time para aplicar los cambios
$resultadoJSON.result = $resultadoJSON.result -and (Ejecutar-Comando "Restart-Service w32time")

# Forzar una sincronización inmediata
$resultadoJSON.result = $resultadoJSON.result -and (Ejecutar-Comando "w32tm /resync")

# Verificar el estado de sincronización
$estatus = Ejecutar-Comando "w32tm /query /status"
$resultadoJSON.data = $estatus

# Establecer la zona horaria en Central Standard Time
$resultadoJSON.result = $resultadoJSON.result -and (Ejecutar-Comando 'tzutil /s "Central Standard Time"')

# Convertir el objeto JSON a una cadena JSON
$jsonResultado = $resultadoJSON | ConvertTo-Json

# Imprimir el resultado JSON
Write-Output $jsonResultado
`
