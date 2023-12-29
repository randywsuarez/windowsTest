export default `
# Obtener la información de systeminfo
$systemInfo = systeminfo

# Filtrar la información que necesitas
$osName = $systemInfo | Select-String 'OS Name:' | ForEach-Object { $_.ToString().Split(':')[-1].Trim() }
$registeredOrganization = $systemInfo | Select-String 'Registered Organization:' | ForEach-Object { $_.ToString().Split(':')[-1].Trim() }

# Utilizar una expresión regular para extraer la fecha
$originalInstallDateMatch = $systemInfo | Select-String 'Original Install Date: (.+)' | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }

# Mantener la cadena de fecha sin cambios
$originalInstallDate = $originalInstallDateMatch

$systemModel = $systemInfo | Select-String 'System Model:' | ForEach-Object { $_.ToString().Split(':')[-1].Trim() }

# Crear un objeto PowerShell con la información filtrada
$systemInfoObject = @{
    'OS' = $osName
    'Organization' = $registeredOrganization
    'Date' = $originalInstallDate
    'Model' = $systemModel
}

# Convertir el objeto a formato JSON
$jsonSystemInfo = $systemInfoObject | ConvertTo-Json

# Mostrar el resultado
Write-Output $jsonSystemInfo
`
