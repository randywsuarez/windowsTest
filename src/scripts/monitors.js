export default `
# Obtener información básica del monitor
$monitors = Get-WmiObject -Namespace root\\wmi -Class WmiMonitorID

$monitorList = @()

foreach ($monitor in $monitors) {
    # Convertir ProductCodeID y SerialNumberID a cadena
    $productCodeID = [System.Text.Encoding]::ASCII.GetString($monitor.ProductCodeID)
    $serialNumberID = [System.Text.Encoding]::ASCII.GetString($monitor.SerialNumberID)
    $friendlyName = [System.Text.Encoding]::ASCII.GetString($monitor.UserFriendlyName)
    # Eliminar caracteres nulos
    $productCodeID = $productCodeID -replace '\\x00',''
    $serialNumberID = $serialNumberID -replace '\\x00',''
    $friendlyName = $friendlyName -replace '\\x00',''

    # Crear un objeto con la información del monitor
    $monitorInfo = @{
        ProductCodeID = $productCodeID
        SerialNumberID = $serialNumberID
        FriendlyName = $friendlyName
    }

    # Añadir el objeto a la lista
    $monitorList += $monitorInfo
}

# Convertir la lista de monitores a JSON y mostrarla
$monitorList | ConvertTo-Json
`
