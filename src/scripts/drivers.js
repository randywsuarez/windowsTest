export default `
# Initialize errorInfo structure
$errorInfo = @{
    status = "PASS"
    video = $true
    missingDrivers = @()
    goodDrivers = @()
}

# Get all devices
$allDevices = Get-CimInstance -ClassName Win32_PnPEntity

# Detect if we actually have physical PS/2 devices
$realPS2Devices = Get-CimInstance -ClassName Win32_PointingDevice | Where-Object { $_.Name -like "*PS/2*" } | Measure-Object
$realPS2Keyboard = Get-CimInstance -ClassName Win32_Keyboard | Where-Object { $_.Name -like "*PS/2*" } | Measure-Object

# Determine if we are on a modern computer without PS/2
$hasRealPS2Devices = ($realPS2Devices.Count -gt 0) -or ($realPS2Keyboard.Count -gt 0)

# Check for missing or error drivers
foreach ($device in $allDevices) {
    # Check if it's a virtual PS/2 device on a computer without real PS/2
    $isVirtualPS2 = ($device.Description -like "*PS/2*") -and (-not $hasRealPS2Devices)
    
    if ($device.ConfigManagerErrorCode -ne 0) {
        # If it's a virtual PS/2 on a computer without PS/2, ignore it
        if ($isVirtualPS2) {
            # Add to the list of working drivers, but with a note
            $errorInfo.goodDrivers += "$($device.Description) [Ignored - Virtual PS/2]"
        } else {
            # Add to the list of missing or error drivers
            $errorInfo.missingDrivers += $device.Description
            # Change status to FAIL
            $errorInfo.status = "FAIL"
        }
    } else {
        # Add to the list of drivers that are working correctly
        $errorInfo.goodDrivers += $device.Description
    }
}

# Video controller verification
$videoDriver = Get-CimInstance -ClassName Win32_PnPEntity | Where-Object {
    $_.Caption -eq "Microsoft Basic Display Adapter" -or
    $_.Caption -eq "Standard VGA Graphics Adapter" -or
    $_.Caption -eq "Video Controller (VGA Compatible)"
}

# If a generic video controller is found
if ($videoDriver) {
    $errorInfo.video = $false
    $errorInfo.status = "FAIL"
}

# ADDITIONAL SAFETY MEASURE: Remove any PS/2 device from missingDrivers
$errorInfo.missingDrivers = $errorInfo.missingDrivers | Where-Object { $_ -notlike "*PS/2*" }

# Ensure missingDrivers is always an array, not null
if ($null -eq $errorInfo.missingDrivers) {
    $errorInfo.missingDrivers = @()
}

# If after removing PS/2 there are no missingDrivers and video is good, change status to PASS
if ($errorInfo.missingDrivers.Count -eq 0 -and $errorInfo.video -eq $true) {
    $errorInfo.status = "PASS"
}

# Return the result in JSON format
$errorInfo | ConvertTo-Json


`
