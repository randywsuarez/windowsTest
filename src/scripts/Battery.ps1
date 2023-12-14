#Write-Host "`n   10. Battery Verification Process"

# Verificar si hay una batería presente
$batteryPresent = Get-WmiObject -Class Win32_Battery

if ($batteryPresent) {
    $InfoAlertPercent = 80
    $WarnAlertPercent = 50
    $CritAlertPercent = 70
    $BatteryHealth = ""

    # Generar el informe de la batería
    & powercfg /batteryreport /XML /OUTPUT "batteryreport.xml" | Out-null

    if (Test-Path $pathScript"batteryreport.xml") {
        Start-Sleep 1
        [xml]$b = Get-Content batteryreport.xml

        if ($b.BatteryReport.Batteries.childnodes.count -gt 0) {
            $batteryResults = @()

            $b.BatteryReport.Batteries |
            ForEach-Object {
                $batteryHealth = [math]::floor([int64]$_.Battery.FullChargeCapacity / [int64]$_.Battery.DesignCapacity * 100)

                $batteryResult = [PSCustomObject]@{
                    DesignCapacity = $_.Battery.DesignCapacity
                    FullChargeCapacity = $_.Battery.FullChargeCapacity
                    BatteryHealth = $batteryHealth
                    CycleCount = $_.Battery.CycleCount
                    ID = $_.Battery.id
                    Status = "pass"
                }

                $batteryResults += $batteryResult

                if ($batteryHealth -le $CritAlertPercent) {
                    $batteryResult.Status = "fail"
                }
            }

            # Convertir el resultado en formato JSON
            $jsonResult = $batteryResults | ConvertTo-Json

            # Mostrar el resultado JSON
            Write-Host $jsonResult

            # Resto del script...

        }
    }

    # Eliminar el archivo de informe de la batería
    Remove-Item "batteryreport.xml" -Force | Out-Null
} else {
    #$txtFileTest += "The unit does not have a Battery NO BATTERY DETECTED`n"
    #Write-Host "    [NO] The unit does not have a Battery" -ForegroundColor Red

    # Resultado JSON cuando no hay batería
    $jsonResultNoBattery = @{
        Status = "NO BATTERY DETECTED"
    } | ConvertTo-Json

    # Mostrar el resultado JSON cuando no hay batería
    Write-Host $jsonResultNoBattery

    # Resto del script...
}
