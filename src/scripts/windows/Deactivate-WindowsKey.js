export default `
# Function to deactivate and remove the current Windows product key
function Remove-WindowsKey {
    # Deactivate Windows using slmgr.vbs /upk (Uninstall product key)
    $uninstallKeyResult = (Invoke-Expression "slmgr.vbs /upk") 2>&1

    # Check if the key was uninstalled successfully
    if ($uninstallKeyResult -like "*successfully*") {
        # Remove the key from the registry using slmgr.vbs /cpky (Clear product key)
        $clearKeyResult = (Invoke-Expression "slmgr.vbs /cpky") 2>&1

        if ($clearKeyResult -like "*successfully*") {
            $status = @{
                "success" = 1
                "message" = "Windows product key was successfully removed from the system."
            }
        } else {
            # Failed to clear the key from the registry
            $status = @{
                "success" = 0
                "message" = "Failed to clear the product key from the registry. Reason: $clearKeyResult"
            }
        }
    } else {
        # Failed to uninstall the key
        $status = @{
            "success" = 0
            "message" = "Failed to uninstall the product key. Reason: $uninstallKeyResult"
        }
    }

    # Return the status as JSON
    return $status | ConvertTo-Json
}

# Call the function to remove the current product key
$removeKeyResult = Remove-WindowsKey

# Output the result
$removeKeyResult
`
