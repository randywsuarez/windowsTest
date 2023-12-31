export default `
param(
    [string]$fileName = ""
)
dxdiag /t $fileName

# Esperar hasta que el archivo exista
while (-not (Test-Path $fileName)) {
    Start-Sleep -Seconds 1
}

# Leer el contenido del archivo y almacenarlo en una propiedad llamada "result"
$result = @{
    result = (Get-Content -Path $fileName -Raw)
}

# Mostrar el contenido en formato JSON en la consola
ConvertTo-Json $result
`
