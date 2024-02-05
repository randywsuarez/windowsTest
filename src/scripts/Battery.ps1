$BatteryDriver = Get-PnpDevice | Where-Object { $_.FriendlyName -eq 'Microsoft AC Adapter' }

if ($BatteryDriver -eq $null) {
    $msgBody = "El controlador de la batería no está instalado. Por favor, instale el controlador de la batería y vuelva a ejecutar el script."
    $msgTitle = "Error de controlador de batería"
    $msgButton = 'OK'
    $msgImage = 'Error'
    $result = [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
    exit
}
$batteryResults = @()
$InfoAlertPercent = "80"
$WarnAlertPercent = "50"
$CritAlertPercent = "20"
$BatteryHealth = ""
& powercfg /batteryreport /XML /OUTPUT "batteryreport.xml" | Out-null
        if (Test-Path $pathScript"batteryreport.xml") {
            Start-Sleep 1
            [xml]$b = Get-Content batteryreport.xml

            if($b.BatteryReport.Batteries.childnodes.count -gt 0 ){

                $b.BatteryReport.Batteries |
                ForEach-Object{
                $batteryHealth = [math]::floor([int64]$_.Battery.FullChargeCapacity/[int64]$_.Battery.DesignCapacity*100)

                if (([int64]$_.Battery.FullChargeCapacity/[int64]$_.Battery.DesignCapacity)*100 -gt $InfoAlertPercent){

                    #$BatteryHealth="Great"
                    $txtFileTest+="Battery test PASS, Design Capacity = "+$_.Battery.DesignCapacity+", Full Charge Capacity= "+$_.Battery.FullChargeCapacity+", Battery Health= "+$batteryHealth+"%, Cycle Count= "+$_.Battery.CycleCount+" ID= "+$_.Battery.id+"`n"

                    $batteryResult = [PSCustomObject]@{
                    DesignCapacity = $_.Battery.DesignCapacity
                    FullChargeCapacity = $_.Battery.FullChargeCapacity
                    BatteryHealth = $batteryHealth
                    CycleCount = $_.Battery.CycleCount
                    ID = $_.Battery.id
                    Status = "pass"
                }

                }else{

                    #$BatteryHealth="Critical"

                    $batteryResult = [PSCustomObject]@{
                    DesignCapacity = $_.Battery.DesignCapacity
                    FullChargeCapacity = $_.Battery.FullChargeCapacity
                    BatteryHealth = $batteryHealth
                    CycleCount = $_.Battery.CycleCount
                    ID = $_.Battery.id
                    Status = "fail"
                }
                Write-Host ($batteryResult | ConvertTo-Json)
                    exit

                }
            }

        }else{
                #Fail

                $batteryResult = [PSCustomObject]@{
                    DesignCapacity = $_.Battery.DesignCapacity
                    FullChargeCapacity = $_.Battery.FullChargeCapacity
                    BatteryHealth = $batteryHealth
                    CycleCount = $_.Battery.CycleCount
                    ID = $_.Battery.id
                    Status = "fail"
                }
                Write-Host ($batteryResult | ConvertTo-Json)
                exit

            }

            Remove-Item "batteryreport.xml" -force | Out-Null
                Write-Host ($batteryResult | ConvertTo-Json)

        }else{
            #rebbot

            $msgBody = "The Unit will reboot, when it does please restart the ISP Windows Test Process"
            $msgTitle = "Unit needs to reboot"
            $msgButton = 'OK'
            $msgImage = 'Information'
            $result = [System.Windows.Forms.MessageBox]::Show($msgBody,$msgTitle,$msgButton,$msgImage)

            Restart-Computer -Force

        }
