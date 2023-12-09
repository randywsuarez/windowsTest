# Obtener la descripción del sistema
$description = (Get-WmiObject win32_computerSystem).Model

# Verificar si la descripción está vacía y asignar #NA en ese caso
if (-not $description) {
    $description = "#NA"
}

# Obtener el número de serie
$serial = (Get-WmiObject -Class Win32_BIOS).SerialNumber

# Obtener el SKU
$sku = (Get-WmiObject win32_computerSystem).SystemSKUNumber

# Crear un objeto PowerShell con la información
$deviceInfo = @{
    Description = $description
    Serial = $serial
    SKU = $sku
}

# Convertir el objeto a formato JSON
$deviceInfoJson = $deviceInfo | ConvertTo-Json

# Devolver el JSON
$deviceInfoJson
