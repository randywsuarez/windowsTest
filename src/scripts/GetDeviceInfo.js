export default `
# Obtener el modelo de la computadora
$description = (Get-WmiObject win32_computerSystem).Model
if (-not $description) {
    $description = "#NA"
}

# Obtener el número de serie
$serial = (Get-WmiObject -Class Win32_BIOS).SerialNumber
if (-not $serial) {
    $serial = $null
}

# Obtener el SKU del sistema
$sku = (Get-WmiObject win32_computerSystem).SystemSKUNumber
if (-not $sku) {
    $sku = $null
}

# Crear un objeto con la información del dispositivo
$deviceInfo = @{
    Description = $description
    Serial = $serial
    SKU = $sku
}

# Convertir el objeto a JSON
$deviceInfoJson = $deviceInfo | ConvertTo-Json

# Imprimir el JSON resultante
$deviceInfoJson
`
