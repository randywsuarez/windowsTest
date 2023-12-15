$brightnessMethods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods
    $maxBrightness = 100
    $minBrightness = 15
    $steps = 10
    for ($brightness = $maxBrightness; $brightness -ge $minBrightness; $brightness -= $maxBrightness / $steps) {
        $brightnessMethods.WmiSetBrightness(1, [int]$brightness)
        Start-Sleep -Milliseconds 400
    }
    for ($brightness = $minBrightness; $brightness -le $maxBrightness; $brightness += $maxBrightness / $steps) {
        $brightnessMethods.WmiSetBrightness(1, [int]$brightness)
        Start-Sleep -Milliseconds 400
    }
    Write-Host @{
      Status = 'end'
    }
