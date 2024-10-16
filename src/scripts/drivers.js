export default `
# Inicializar la estructura de errorInfo
$errorInfo = @{
    status = "PASS"
    video = $true
    missingDrivers = @()
    goodDrivers = @()
}

# Obtener todos los dispositivos
$allDevices = Get-CimInstance -ClassName Win32_PnPEntity

# Verificar si hay drivers faltantes o con errores
foreach ($device in $allDevices) {
    if ($device.ConfigManagerErrorCode -ne 0) {
        # Agregar a la lista de drivers faltantes o con error
        $errorInfo.missingDrivers += $device.Description
        # Cambiar estado a FAIL
        $errorInfo.status = "FAIL"
    } else {
        # Agregar a la lista de drivers que están funcionando correctamente
        $errorInfo.goodDrivers += $device.Description
    }
}

# Verificación del controlador de video
$videoDriver = Get-CimInstance -ClassName Win32_PnPEntity | Where-Object {
    $_.Caption -eq "Microsoft Basic Display Adapter" -or
    $_.Caption -eq "Standard VGA Graphics Adapter" -or
    $_.Caption -eq "Video Controller (VGA Compatible)"
}

# Si se encuentra un controlador de video genérico
if ($videoDriver) {
    $errorInfo.video = $false
    $errorInfo.status = "FAIL"
}

# Retornar el resultado en formato JSON
$errorInfo | ConvertTo-Json


`
