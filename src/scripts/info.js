export default `
# Cargar ensamblado necesario para usar ciertas funciones de .NET
Add-Type -AssemblyName System.Windows.Forms

# Obtener el nombre de las interfaces Wi-Fi que no son virtuales y tienen una MAC
$wifi = Get-WmiObject -Query "SELECT * FROM Win32_NetworkAdapter WHERE MACAddress IS NOT NULL AND NOT Name LIKE '%Virtual%' AND Name LIKE '%Wi-Fi%'" | Select-Object -ExpandProperty Name

# Obtener el nombre de las interfaces Bluetooth
$bluetoothDevices = Get-WmiObject -Query "SELECT * FROM Win32_NetworkAdapter WHERE Name LIKE '%Bluetooth%'" | Select-Object -ExpandProperty Name
$bluetooth = if ($bluetoothDevices) { "YES" } else { "NO" }

# Buscar dispositivos de huella digital
$fingerprintDevices = Get-WmiObject -Query "SELECT * FROM Win32_PnPEntity WHERE Name LIKE '%Fingerprint%'" | Select-Object -ExpandProperty Name
$fingerprint = if ($fingerprintDevices) { "YES" } else { "NO" }

# Obtener información detallada del teclado
$keyboardInfo = Get-WmiObject Win32_Keyboard
$backlight = if ($keyboardInfo.Backlight) { "YES" } else { "NO" }
$keyboardLayout = $keyboardInfo.Layout
$numericKeypad = if ($keyboardLayout -like "*Numeric*") { "YES" } else { "NO" }

# Buscar dispositivos Plug and Play con descripción relacionada a privacidad (Privacy)
$privacyButtonDevices = Get-WmiObject Win32_PnPEntity | Where-Object { $_.Description -like "*privacy*" }
$privacy = if ($privacyButtonDevices) { "YES" } else { "NO" }

# Obtener los dispositivos NFC
$nfcDevice = Get-PnpDevice | Where-Object {$_.Class -eq "NFC"}
$nfc = if ($nfcDevice) { "YES" } else { "NO" }

# Obtener adaptadores de red WWAN
$networkAdapters = Get-NetAdapter
$hasWWAN = $networkAdapters | Where-Object { $_.MediaType -eq "Wireless WAN" -or $_.Name -like "*Cellular*" }
$wwan = if ($hasWWAN) { "YES" } else { "NO" }

# Obtener la resolución de la pantalla principal
$mainScreen = [System.Windows.Forms.Screen]::PrimaryScreen
$resolution = $mainScreen.Bounds.Width.ToString() + "x" + $mainScreen.Bounds.Height.ToString()

# Buscar dispositivos táctiles registrados como Human Interface Device (HID)
$touchDevices = Get-PnpDevice | Where-Object { $_.Class -eq 'HIDClass' -and $_.FriendlyName -like '*Touch*' }
$touchScreen = if ($touchDevices) { "YES" } else { "NO" }

# Obtener la descripción de la cámara o webcam
$cameraDevices = Get-WmiObject -Query "SELECT * FROM Win32_PnPEntity WHERE Description LIKE '%camera%' OR Description LIKE '%webcam%'" | Select-Object -ExpandProperty Description
$camera = if ($cameraDevices) { $cameraDevices -join ", " } else { "NO" }

# Crear objeto JSON con todas las propiedades recopiladas, agrupando relacionados bajo Display
$jsonResult = @{
    WiFi = $wifi
    Bluetooth = $bluetooth
    Fingerprint = $fingerprint
    Keyboard = @{ Backlight = $backlight; NumericKeypad = $numericKeypad }
    Privacy = $privacy
    NFC = $nfc
    WWAN = $wwan
    Display = @{ Resolution = $resolution; TouchScreen = $touchScreen }
    Webcam = $camera
} | ConvertTo-Json

# Imprimir el resultado JSON
Write-Output $jsonResult
`
