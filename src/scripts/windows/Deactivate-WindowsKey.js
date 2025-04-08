export default `
# Function to deactivate the current Windows product key without removing it from the registry
function Remove-WindowsKey {
    try {
        # Deactivate Windows using slmgr.vbs /upk (Uninstall product key)
        $deactivateKeyResult = (Invoke-Expression "slmgr.vbs /upk") 2>&1

        # Check if the key was deactivated successfully
        if ($deactivateKeyResult -like "*successfully*") {
            $status = @{
                "success" = 1
                "message" = "Windows product key was successfully deactivated."
            }
        }
        else {
            # Failed to deactivate the key
            $status = @{
                "success" = 0
                "message" = "Failed to deactivate the product key. Reason: $deactivateKeyResult"
            }
        }
    }
    catch {
        $status = @{
            "success" = 0
            "message" = "An error occurred while deactivating the product key: $_"
        }
    }

    # Return the status as JSON, preserving the business logic structure
    return $status | ConvertTo-Json
}

# Call the function to deactivate the current product key
$removeKeyResult = Remove-WindowsKey

# Output the result (keeps the structure of $removeKeyResult)
Write-Output $removeKeyResult
`
