$keyWindows = (Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey
$os = Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption

function CheckAndActivateWindows {
    while ($ta.LicenseStatus -ne 1) {
        Write-Host "`n     7.1 Activating Windows..." 
        Write-Host "      [OK] Windows Product Key: $keyWindows" -ForegroundColor Green
        
        $activationResult = Start-Process -FilePath "slmgr.vbs" -ArgumentList "/ipk $keyWindows" -PassThru
        $activationResult = Start-Process -FilePath "slmgr.vbs" -ArgumentList "/ato" -PassThru

        Start-Sleep -Seconds 3
        $ta = Get-CimInstance -ClassName SoftwareLicensingProduct -Filter "PartialProductKey IS NOT NULL" |
            Where-Object -Property Name -Like "Windows*"            
    } 
}

$ta = Get-CimInstance -ClassName SoftwareLicensingProduct -Filter "PartialProductKey IS NOT NULL" |
    Where-Object -Property Name -Like "Windows*"

$activationStatus = $false

if ($ta.LicenseStatus -eq 1) {
    $activation = "Windows Activated Successfully"
    $activationStatus = $true
    Write-Host "    [OK] $activation" -ForegroundColor Green
} else {
    CheckAndActivateWindows
    $activation = "Windows Activated Successfully"
    $activationStatus = $true
    Write-Host "    [OK] $activation" -ForegroundColor Green
}

$output = @{
    activation = $activation
    os = $os
    keyWindows = $keyWindows
    activationStatus = $activationStatus
} | ConvertTo-Json

Write-Output $output

Start-Process "ms-settings:activation"
