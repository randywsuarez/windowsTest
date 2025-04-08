export default `
# Function to activate Windows by injecting a new product key. Includes retry logic with UI for online activation.
function Activate-Windows {
    $productKey = "$dpk"
    $activationMode = "$mode"

    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
    } catch {
        $activationStatus = @{
            "activated" = 0
            "message" = "Internal Script Error: Failed to load UI components"
            "error" = $true
            "productKeyUsed" = $productKey
        }
        return $activationStatus | ConvertTo-Json -Compress
    }

    try {
        # Install the product key using direct command execution
        $installKeyResult = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /ipk $productKey) 2>&1
        
        if ($installKeyResult -like "*successfully*") {
            # Wait for the system to process the key
            Start-Sleep -Seconds 3

            if ($activationMode -eq "online") {
                # Attempt online activation
                $activateResult = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /ato) 2>&1
                Start-Sleep -Seconds 5

                # Get detailed license information
                $licenseInfo = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /dli) 2>&1
                $activationStatus = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /xpr) 2>&1

                if ($activationStatus -like "*permanently activated*") {
                    $baseStatus = @{
                        "activated" = 1
                        "message" = "Windows was successfully activated online"
                        "error" = $false
                        "productKeyUsed" = $productKey
                    }
                    # Add additional information to base status
                    $baseStatus["detailedStatus"] = @{
                        "licenseStatus" = $activationStatus
                        "licenseInfo" = $licenseInfo
                        "activationResult" = $activateResult
                    }
                    return $baseStatus | ConvertTo-Json -Compress
                } else {
                    $baseStatus = @{
                        "activated" = 0
                        "message" = "Activation attempt failed"
                        "error" = $true
                        "productKeyUsed" = $productKey
                    }
                    # Add additional information to base status
                    $baseStatus["detailedStatus"] = @{
                        "licenseStatus" = $activationStatus
                        "licenseInfo" = $licenseInfo
                        "activationResult" = $activateResult
                    }
                    return $baseStatus | ConvertTo-Json -Compress
                }
            } else {
                # Offline mode
                $licenseInfo = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /dli) 2>&1
                $activationStatus = (cscript.exe C:\\Windows\\System32\\slmgr.vbs /xpr) 2>&1
                
                $baseStatus = @{
                    "activated" = 0
                    "message" = "Offline mode: License information retrieved"
                    "error" = $false
                    "productKeyUsed" = $productKey
                }
                # Add additional information to base status
                $baseStatus["detailedStatus"] = @{
                    "licenseStatus" = $activationStatus
                    "licenseInfo" = $licenseInfo
                }
                return $baseStatus | ConvertTo-Json -Compress
            }
        } else {
            return @{
                "activated" = 0
                "message" = "Failed to install product key. Result: $installKeyResult"
                "error" = $true
                "productKeyUsed" = $productKey
            } | ConvertTo-Json -Compress
        }
    } catch {
        return @{
            "activated" = 0
            "message" = "An unexpected error occurred: $($_.Exception.Message)"
            "error" = $true
            "productKeyUsed" = $productKey
        } | ConvertTo-Json -Compress
    }
}

Activate-Windows
`
