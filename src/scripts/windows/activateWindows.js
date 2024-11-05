export default `
# Function to activate Windows by providing a product key
function Activate-Windows {
    param (
        [string]$productKey,
        [ValidateSet("online", "offline")]
        [string]$activationMode = "online"  # Can be "online" or "offline"
    )

    # Install the product key using slmgr.vbs
    $installKeyResult = (Invoke-Expression "cscript C:\\Windows\\System32\\slmgr.vbs /ipk $productKey") 2>&1

    # Check if the key was installed successfully
    if ($installKeyResult -like "*successfully*") {
        $error = $false  # No error occurred during the injection of the product key

        if ($activationMode -eq "online") {
            # Activate Windows online
            $activateResult = (Invoke-Expression "cscript C:\\Windows\\System32\\slmgr.vbs /ato") 2>&1
        } elseif ($activationMode -eq "offline") {
            # Activate Windows offline
            $activateResult = (Invoke-Expression "cscript C:\\Windows\\System32\\slmgr.vbs /dli") 2>&1
        }

        # Wait for a few seconds to give time for activation to complete
        Start-Sleep -Seconds 10

        # Check if activation was successful after waiting
        $activationStatusCheck = (Invoke-Expression "cscript C:\\Windows\\System32\\slmgr.vbs /xpr") 2>&1

        if ($activationStatusCheck -like "*permanently activated*") {
            $activationStatus = @{
                "activated" = 1
                "message" = "Windows was successfully activated."
                "error" = $false
                "productKeyUsed" = $productKey
            }
        } else {
            # Activation failed
            $activationStatus = @{
                "activated" = 0
                "message" = "Failed to activate Windows. Reason: $activateResult. Status after waiting: $activationStatusCheck"
                "error" = $true
                "productKeyUsed" = $productKey
            }
        }
    } else {
        # Key installation failed
        $activationStatus = @{
            "activated" = 0
            "message" = "Failed to install product key. Reason: $installKeyResult"
            "error" = $true
            "productKeyUsed" = $productKey
        }
    }

    # Return the activation status as JSON
    return $activationStatus | ConvertTo-Json
}

# Example usage
Activate-Windows -productKey $dpk -activationMode $mode

`
