export default `
# Boolean flag to determine whether to activate Windows if it's not already activated
$shouldActivate = $true  # Set to $true to activate if not activated

# Function to activate Windows by providing a product key
function Activate-Windows {
    param (
        [string]$productKey
    )

    # Install the product key using slmgr.vbs
    $installKeyResult = (Invoke-Expression "slmgr.vbs /ipk $productKey") 2>&1

    # Check if the key was installed successfully
    if ($installKeyResult -like "*successfully*") {
        # Activate Windows
        $activateResult = (Invoke-Expression "slmgr.vbs /ato") 2>&1

        # Check if activation was successful
        if ($activateResult -like "*successfully*") {
            $activationStatus = @{
                "activated" = 1
                "message" = "Windows was successfully activated."
            }
        } else {
            # Activation failed
            $activationStatus = @{
                "activated" = 0
                "message" = "Failed to activate Windows. Reason: $activateResult"
            }
        }
    } else {
        # Key installation failed
        $activationStatus = @{
            "activated" = 0
            "message" = "Failed to install product key. Reason: $installKeyResult"
        }
    }

    # Return the activation status as JSON
    return $activationStatus | ConvertTo-Json
}

# Function to retrieve the Windows licenses on the system
function Get-WindowsLicenses {
    $licenses = Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object { $_.Name -like "*Windows*" -and $_.PartialProductKey -ne $null }
    return $licenses
}

# Function to get the description of the license status
function Get-LicenseStatusDescription {
    param ($status)

    switch ($status) {
        0 { return "Unlicensed - No license found" }
        1 { return "Licensed - Windows is activated" }
        2 { return "Out-of-Box Grace - Activation grace period in progress" }
        3 { return "Out-of-Tolerance Grace - Hardware changes detected, activation required" }
        4 { return "Non-Genuine Grace - Windows detected as not genuine, grace period active" }
        5 { return "Notification - Windows not activated, showing activation notifications" }
        6 { return "Extended Grace - Extended activation grace period active" }
        default { return "Unknown license status" }
    }
}

# Function to retrieve the Windows key from the registry
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

# Function to retrieve the product key from the system (BIOS or digital license)
function Get-WindowsKeyFromSystem {
    try {
        $cmd = 'powershell "(Get-CimInstance -query "select * from SoftwareLicensingService").OA3xOriginalProductKey"'
        $productKey = Invoke-Expression $cmd
        if ($productKey -ne $null) {
            return $productKey
        } else {
            return $null
        }
    } catch {
        return $null
    }
}

# Main function to gather activation and license details
function Get-WindowsActivationInfo {
    param (
        [string]$productKey = $null  # Optional parameter for the product key if activation is required
    )

    $licenses = Get-WindowsLicenses

    # Retrieve the Windows key from the system or registry, only run these once
    $windowsKey = Get-WindowsKeyFromRegistry
    if ($windowsKey -eq $null) {
        $windowsKey = Get-WindowsKeyFromSystem
    }

    # Create an array to store each license object
    $licensesArray = @()
    $activationRequired = $false

    foreach ($license in $licenses) {
        $licenseStatus = $license.LicenseStatus
        $statusDescription = Get-LicenseStatusDescription -status $licenseStatus
        $edition = $license.Name

        # Check if Windows is not activated (LicenseStatus not equal to 1)
        if ($licenseStatus -ne 1) {
            $activationRequired = $true
        }

        # Create an object for each license
        $licenseObject = @{
            activate        = if ($licenseStatus -eq 1) { 1 } else { 0 }
            keyWindows      = if ($windowsKey -ne $null) { $windowsKey } else { "Key not found" }
            licenseStatus   = $licenseStatus
            licenseDetails  = $statusDescription
            edition         = $edition
        }

        # Add the license object to the array
        $licensesArray += $licenseObject
    }

    # Ensure the array always contains at least one object, even if no licenses are found
    if ($licensesArray.Count -eq 0) {
        $licensesArray += @{
            activate        = 0
            keyWindows      = "No license found"
            licenseStatus   = 0
            licenseDetails  = "Unlicensed - No license found"
            edition         = "Unknown"
        }
    }

    # If Windows is not activated and activation is allowed, attempt to activate
    if ($activationRequired -and $shouldActivate -and $windowsKey -ne $null) {
        $activationResult = Activate-Windows -productKey $windowsKey
        return $activationResult  # Return the activation result in JSON format
    }

    # Return the array of licenses in JSON format (even if it's just one object)
    return @($licensesArray) | ConvertTo-Json
}

# Call the main function
$activationOrLicenseInfo = Get-WindowsActivationInfo

# Output the result
$activationOrLicenseInfo
`
