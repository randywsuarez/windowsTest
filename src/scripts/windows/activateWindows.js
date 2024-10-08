export default `
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

        # Wait for a few seconds to give time for activation to complete
        Start-Sleep -Seconds 10

        # Check if activation was successful after waiting
        $activationStatusCheck = (Invoke-Expression "slmgr.vbs /xpr") 2>&1

        if ($activationStatusCheck -like "*permanently activated*") {
            $activationStatus = @{
                "activated" = 1
                "message" = "Windows was successfully activated."
            }
        } else {
            # Activation failed
            $activationStatus = @{
                "activated" = 0
                "message" = "Failed to activate Windows. Reason: $activateResult. Status after waiting: $activationStatusCheck"
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

Activate-Windows -productKey '$productKey'
`
