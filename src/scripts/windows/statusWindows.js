export default `
# Windows Digital Product Key (DPK) Finder and Simplified Output - Optimized for Speed
# This script requires administrator privileges for complete results

# Set PowerShell to optimize for speed and suppress warnings
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$WarningPreference = "Continue"

# Add logging function
function Write-Log {
    param($Message)
    # Silently log without output
}

# Verify administrator privileges - simplified check
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Log "Admin check: $isAdmin"
if (-not $isAdmin) {
    # Instead of Write-Warning, we'll include this in the result object
    $adminWarning = "Limited information available without administrator privileges."
} else {
    $adminWarning = $null
}

# Function to get Windows edition information - Using faster CIM method
function Get-WindowsEditionInfo {
    try {
        # Use CimInstance instead of WMI for better performance
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -Property Caption,Version,BuildNumber -ErrorAction Stop
        return @{
            Edition = $os.Caption
            Version = $os.Version
            BuildNumber = $os.BuildNumber
        }
    } catch {
        # Fallback to direct registry access which is faster than WMI in failure scenarios
        try {
            $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion"
            return @{
                Edition = (Get-ItemProperty -Path $regPath -Name ProductName -ErrorAction Stop).ProductName
                Version = (Get-ItemProperty -Path $regPath -Name CurrentVersion -ErrorAction Stop).CurrentVersion
                BuildNumber = (Get-ItemProperty -Path $regPath -Name CurrentBuildNumber -ErrorAction Stop).CurrentBuildNumber
            }
        } catch {
            return @{
                Edition = "Unknown"
                Version = "Unknown"
                BuildNumber = "Unknown"
            }
        }
    }
}

# Function to get BIOS key directly using CIM with error handling
function Get-BiosProductKeyWithSafety {
    try {
        # Try to get the BIOS key using CIM
        $biosKey = Get-CimInstance -ClassName SoftwareLicensingService -ErrorAction SilentlyContinue |
                   Select-Object -ExpandProperty OA3xOriginalProductKey

        if (-not [string]::IsNullOrEmpty($biosKey)) {
            return $biosKey
        }

        # Fallback to WMI if CIM fails
        $wmiKey = Get-WmiObject -Query "SELECT OA3xOriginalProductKey FROM SoftwareLicensingService" -ErrorAction SilentlyContinue
        if ($wmiKey -ne $null -and -not [string]::IsNullOrEmpty($wmiKey.OA3xOriginalProductKey)) {
            return $wmiKey.OA3xOriginalProductKey
        }

        # If both methods fail, return null
        return $null
    } catch {
        Write-Verbose "Error retrieving BIOS key: $_"
        return $null
    }
}

# Function to get OEM Key from BIOS/UEFI
function Get-BiosProductKey {
    try {
        # Try to get the BIOS key with our safer method
        $biosKey = Get-BiosProductKeyWithSafety

        if (-not [string]::IsNullOrEmpty($biosKey)) {
            return @{
                Source = "BIOS/UEFI OEM"
                Key = $biosKey
                IsComplete = $true
            }
        }
        return $null
    } catch {
        Write-Verbose "Error retrieving BIOS/UEFI product key: $_"
        return $null
    }
}

# Function to extract product key from registry (encoded)
function Get-InstalledProductKey {
    try {
        # Registry path for the encoded product key
        $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion"

        # Get the encoded binary data
        $digitalProductId = (Get-ItemProperty -Path $regPath -Name DigitalProductId -ErrorAction SilentlyContinue).DigitalProductId

        if ($null -eq $digitalProductId) {
            Write-Verbose "DigitalProductId not found in registry"
            return $null
        }

        # Verify array length
        if ($digitalProductId.Length -lt 68) {
            Write-Verbose "Invalid DigitalProductId length: $($digitalProductId.Length)"
            return $null
        }

        # Decode the product key using the known algorithm
        $key = ""
        $keyOffset = 52
        $isWin8AndUp = $false

        # Check Windows version for proper decoding
        if ([System.Environment]::OSVersion.Version.Major -ge 6) {
            if ([System.Environment]::OSVersion.Version.Minor -ge 2) {
                $isWin8AndUp = $true
            }
        }

        # Decoding logic for Windows 8 and above
        if ($isWin8AndUp) {
            $digitalProductId[66] = [byte]($digitalProductId[66] -band 0xF7)
            $hex = ""
            for ($i = 52; $i -le 67; $i++) {
                $hex += $digitalProductId[$i].ToString("X2")
            }

            return @{
                Source = "Registry (Current Installation)"
                Key = "XXXXX-XXXXX-XXXXX-XXXXX-" + $hex.Substring($hex.Length - 5)
                IsComplete = $false
                Note = "Windows 8+ uses a more complex key algorithm. Only last segment shown."
            }
        } else {
            # Traditional decoding for pre-Windows 8
            $chars = "BCDFGHJKMPQRTVWXY2346789".ToCharArray()
            for ($i = 28; $i -ge 0; $i--) {
                $cur = 0
                for ($j = 14; $j -ge 0; $j--) {
                    $cur = $cur * 256
                    $cur = $digitalProductId[$j + $keyOffset] + $cur
                    $digitalProductId[$j + $keyOffset] = [math]::Floor([double]($cur / 24))
                    $cur = $cur % 24
                }
                $key = $chars[$cur] + $key
                if (($i % 5) -eq 0 -and $i -ne 0) {
                    $key = "-" + $key
                }
            }

            return @{
                Source = "Registry (Current Installation)"
                Key = $key
                IsComplete = $true
            }
        }
    } catch {
        Write-Verbose "Error decoding installed product key: $_"
        return $null
    }
}

# Function to check license status - Optimized with CIM instead of WMI
function Get-LicenseStatus {
    try {
        $licenseStatus = 0
        $licenseDetails = "Unlicensed - No license found"

        # Get active license using CIM (much faster than WMI)
        # Only query once with minimal property selection for better performance
        $license = Get-CimInstance -Query "SELECT Name, LicenseStatus FROM SoftwareLicensingProduct WHERE ApplicationId='55c92734-d682-4d71-983e-d6ec3f16059f'" -ErrorAction Stop |
                  Where-Object { $_.LicenseStatus -eq 1 } |
                  Select-Object -First 1

        if ($license -ne $null) {
            $licenseStatus = 1
            $licenseDetails = "Licensed - $($license.Name)"
            return @{
                Status = $licenseStatus
                Details = $licenseDetails
            }
        }

        return @{
            Status = $licenseStatus
            Details = $licenseDetails
        }
    } catch {
        # Use minimal error reporting for speed
        return @{
            Status = 0
            Details = "Error retrieving license status"
        }
    }
}

# Main function to get the Windows product key and activation status - Optimized
function Get-SimplifiedWindowsKey {
    try {
        Write-Log "Starting Get-SimplifiedWindowsKey"

        # Obtener información del sistema operativo
        Write-Log "Getting OS info"
        $osInfo = Get-WmiObject -Class Win32_OperatingSystem
        $osVersion = $osInfo.Version
        $osEdition = $osInfo.Caption
        Write-Log "OS Info retrieved: $osEdition - $osVersion"

        # Obtener estado de la licencia
        Write-Log "Getting license status"
        $licenseStatus = (Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object { $_.PartialProductKey -and $_.Name -like "*Windows*" }).LicenseStatus
        Write-Log "License status retrieved: $licenseStatus"

        # Obtener clave de BIOS
        Write-Log "Getting BIOS key"
        $biosKey = (Get-WmiObject -Class SoftwareLicensingService).OA3xOriginalProductKey
        if ($biosKey) {
            Write-Log "BIOS key found"
        }

        # Obtener clave del registro
        $registryKey = (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SoftwareProtectionPlatform" -Name BackupProductKeyDefault -ErrorAction SilentlyContinue).BackupProductKeyDefault

        # Determinar la fuente de la clave
        $keySource = if ($biosKey) { "BIOS/UEFI OEM" } elseif ($registryKey) { "Registry" } else { "None" }
        $productKey = if ($biosKey) { $biosKey } elseif ($registryKey) { $registryKey } else { "No license found" }

        # Crear objeto de resultado
        $result = @{
            source = $keySource
            licenseDetails = if ($licenseStatus -eq 1) { "Licensed - Windows(R), Core edition" } else { "Unlicensed" }
            activated = if ($licenseStatus -eq 1) { 1 } else { 0 }
            keyWindows = $productKey
            adminWarning = $null
            os = $osVersion
            edition = $osEdition
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            licenseStatus = $licenseStatus
            error = $null
        }

        # Enviar el resultado como JSON
        $result | ConvertTo-Json -Compress

    } catch {
        Write-Log "Error in Get-SimplifiedWindowsKey: $_"
        $errorResult = @{
            source = "Error"
            licenseDetails = "Error occurred"
            activated = 0
            keyWindows = "Error"
            adminWarning = $null
            os = "Unknown"
            edition = "Unknown"
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            licenseStatus = 0
            error = $_.Exception.Message
        }
        $errorResult | ConvertTo-Json -Compress
    }
}

# Execute and return the result in the desired format
Write-Log "Starting script execution"
Get-SimplifiedWindowsKey
Write-Log "Script execution completed"
`

// Example usage:
// console.log(windowsDpkFinderScript);
// You can also export it if needed:
// export default windowsDpkFinderScript;
