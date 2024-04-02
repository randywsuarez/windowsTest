export default `
# Obtener la resolución de la pantalla
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$width = $screen.Bounds.Width
$height = $screen.Bounds.Height

# Formatear la resolución en el formato deseado (por ejemplo: "1024x768")
$resolution = "$width x $height"

# Crear un objeto PowerShell personalizado para el JSON
$jsonObject = @{
    resolution = $resolution
}

# Convertir el objeto a formato JSON
$jsonString = $jsonObject | ConvertTo-Json

# Imprimir el JSON resultante
Write-Output $jsonString

`
