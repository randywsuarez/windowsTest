export default `
$shouldActivate = $true

function Get-WindowsLicenses {
    try {
        return Get-WmiObject -Query "SELECT * FROM SoftwareLicensingProduct WHERE PartialProductKey IS NOT NULL AND Name LIKE '%Windows%'"
    } catch {
        return @()
    }
}

function Get-WindowsKeyFromRegistry {
    try {
        $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SoftwareProtectionPlatform"
        $digitalKey = (Get-ItemProperty -Path $regPath -Name BackupProductKeyDefault).BackupProductKeyDefault
        if ($digitalKey -ne $null) {
            return $digitalKey
        } else {
            return $null
        }
    } catch {
        return $null
    }
}

function Get-WindowsKeyFromSystem {
    try {
        $productKey = (Get-WmiObject -Query "SELECT OA3xOriginalProductKey FROM SoftwareLicensingService").OA3xOriginalProductKey
        if ($productKey -ne $null) {
            return $productKey
        } else {
            return $null
        }
    } catch {
        return $null
    }
}

function Activate-Windows {
    param ([string]$productKey)

    try {
        # Intenta activar Windows con la clave proporcionada
        $activateCommand = "slmgr.vbs /ato"
        cmd /c $activateCommand | Out-Null

        # Verifica el estado de la activación
        $licenseStatus = (Get-WmiObject -Query "SELECT LicenseStatus FROM SoftwareLicensingProduct WHERE PartialProductKey IS NOT NULL AND Name LIKE '%Windows%'").LicenseStatus

        if ($licenseStatus -eq 1) {
            return @{
                status  = "Success"
                message = "Windows activated successfully."
            }
        } else {
            throw "Activation failed. Status: $licenseStatus"
        }
    } catch {
        return @{
            status  = "Error"
            message = "An error occurred during activation: $_"
        }
    }
}

function Get-WindowsActivationInfo {
    $licenses = Get-WindowsLicenses
    $windowsKey = Get-WindowsKeyFromRegistry
    if ($windowsKey -eq $null) {
        $windowsKey = Get-WindowsKeyFromSystem
    }

    $osDescription = try { (Get-WmiObject Win32_OperatingSystem).Caption } catch { "Unknown" }
    $licensesArray = @()
    $activationRequired = $false

    foreach ($license in $licenses) {
        $licenseStatus = $license.LicenseStatus
        $statusDescription = switch ($licenseStatus) {
            0 { "Unlicensed - No license found" }
            1 { "Licensed - Windows is activated" }
            2 { "Out-of-Box Grace - Activation grace period in progress" }
            3 { "Out-of-Tolerance Grace - Hardware changes detected, activation required" }
            4 { "Non-Genuine Grace - Windows detected as not genuine, grace period active" }
            5 { "Notification - Windows not activated, showing activation notifications" }
            6 { "Extended Grace - Extended activation grace period active" }
            default { "Unknown license status" }
        }
        $edition = $license.Name

        if ($licenseStatus -ne 1) {
            $activationRequired = $true
        }

        $licenseObject = @{
            activate        = if ($licenseStatus -eq 1) { 1 } else { 0 }
            keyWindows      = if ($windowsKey -ne $null) { $windowsKey } else { "Key not found" }
            licenseStatus   = $licenseStatus
            licenseDetails  = $statusDescription
            os              = $edition
            edition         = $osDescription
        }

        $licensesArray += $licenseObject
    }

    if ($licensesArray.Count -eq 0) {
        $licensesArray += @{
            activate        = 0
            keyWindows      = "No license found"
            licenseStatus   = 0
            licenseDetails  = "Unlicensed - No license found"
            os              = "Unknown"
            edition         = $osDescription
        }
    }

    if ($activationRequired -and $shouldActivate -and $windowsKey -ne $null) {
        $activationResult = Activate-Windows -productKey $windowsKey
        return $activationResult | ConvertTo-Json -Compress
    }

    return @($licensesArray) | ConvertTo-Json
}

# Ejecutar la función principal
$activationOrLicenseInfo = Get-WindowsActivationInfo
$activationOrLicenseInfo


`
