export default `
$batteryPresent = Get-WmiObject -Class Win32_Battery

if ($batteryPresent) {
    $InfoAlertPercent = 80
    $WarnAlertPercent = 50
    $CritAlertPercent = 70
    $BatteryHealth = ""
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
            $jsonResult = $batteryResults | ConvertTo-Json
            $jsonResult
        }
    }
    Remove-Item "batteryreport.xml" -Force | Out-Null
} else {
    $jsonResultNoBattery = @{
        Status = "fail"
    } | ConvertTo-Json
    $jsonResultNoBattery
}
`
