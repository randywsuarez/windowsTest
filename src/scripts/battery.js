export default `
# Cargar ensamblado de Windows Forms
Add-Type -AssemblyName System.Windows.Forms

# Verificar la existencia del controlador de la batería
$BatteryDriver = Get-PnpDevice | Where-Object { $_.FriendlyName -eq 'Microsoft AC Adapter' }

if ($BatteryDriver -eq $null) {
    $msgBody = "The battery driver is not installed. Please install the battery driver and rerun the script."
    $msgTitle = "Battery Driver Error"
    $msgButton = [System.Windows.Forms.MessageBoxButtons]::OK
    $msgImage = [System.Windows.Forms.MessageBoxIcon]::Error
    [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
    exit
}

# Configuración de alertas
$InfoAlertPercent = 85
$WarnAlertPercent = 50
$CritAlertPercent = 20

# Generar el informe de la batería
& powercfg /batteryreport /XML /OUTPUT "batteryreport.xml" | Out-Null

# Esperar a que el informe se genere
Start-Sleep -Seconds 3

if (Test-Path "batteryreport.xml") {
    [xml]$b = Get-Content "batteryreport.xml"

    if ($b.BatteryReport.Batteries.childnodes.count -gt 0) {
        $batteryResults = @()

        $b.BatteryReport.Batteries.Battery | ForEach-Object {
            $batteryHealth = [math]::floor(([int64]$_.FullChargeCapacity / [int64]$_.DesignCapacity) * 100)

            $status = if ($batteryHealth -gt $InfoAlertPercent) { "pass" } else { "fail" }

            $batteryResult = [PSCustomObject]@{
                DesignCapacity     = $_.DesignCapacity
                FullChargeCapacity = $_.FullChargeCapacity
                BatteryHealth      = $batteryHealth
                CycleCount         = $_.CycleCount
                ID                 = $_.id
                Status             = $status
            }

            $batteryResults += $batteryResult
        }

        # Mostrar resultados y limpiar el archivo
        $batteryResults | ConvertTo-Json | Write-Host
        Remove-Item "batteryreport.xml" -Force | Out-Null
    } else {
        # No se encontraron baterías
        $msgBody = "No batteries were found in the report."
        $msgTitle = "Battery Report Error"
        $msgButton = [System.Windows.Forms.MessageBoxButtons]::OK
        $msgImage = [System.Windows.Forms.MessageBoxIcon]::Error
        [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
        exit
    }
} else {
    # Reiniciar el equipo si el informe no se encuentra
    $msgBody = "The unit will restart. Please restart the Windows ISP test process after the restart."
    $msgTitle = "Unit Needs to Restart"
    $msgButton = [System.Windows.Forms.MessageBoxButtons]::OK
    $msgImage = [System.Windows.Forms.MessageBoxIcon]::Information
    $result = [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)

    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Restart-Computer -Force
    }
}
`
