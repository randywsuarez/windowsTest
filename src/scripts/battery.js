export default `
# Verificar la existencia del controlador de la batería
$BatteryDriver = Get-PnpDevice | Where-Object { $_.FriendlyName -eq 'Microsoft AC Adapter' }

if ($BatteryDriver -eq $null) {
    $msgBody = "El controlador de la batería no está instalado. Por favor, instale el controlador de la batería y vuelva a ejecutar el script."
    $msgTitle = "Error de controlador de batería"
    $msgButton = 'OK'
    $msgImage = 'Error'
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
        $msgBody = "No se encontraron baterías en el informe."
        $msgTitle = "Error de informe de batería"
        $msgButton = 'OK'
        $msgImage = 'Error'
        [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
        exit
    }
} else {
    # Reiniciar el equipo si el informe no se encuentra
    $msgBody = "La unidad se reiniciará, cuando lo haga, por favor reinicie el proceso de prueba de Windows ISP."
    $msgTitle = "La unidad necesita reiniciarse"
    $msgButton = 'OK'
    $msgImage = 'Information'
    [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)

    Restart-Computer -Force
}


`
