export default `
$keyWindows = (Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey
$os = Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption

function CheckAndActivateWindows {
    while ($ta.LicenseStatus -ne 1) {
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
} else {
    CheckAndActivateWindows
    $activation = "Windows Activated Successfully"
    $activationStatus = $true
}

$output = @{
    activation = $activation
    os = $os
    keyWindows = $keyWindows
    activationStatus = $activationStatus
} | ConvertTo-Json
Start-Process "ms-settings:activation"
Write-Output $output


`
