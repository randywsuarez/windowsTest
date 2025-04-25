export default `
# Script to detect BitLocker on Windows volumes
# This script checks if the Windows edition is compatible with BitLocker
# and evaluates all volumes to determine if they have BitLocker enabled

function Get-BitLockerStatus {
    [CmdletBinding()]
    param()
    
    # Main object to store results
    $result = @{
        volumes = @()
        status = $false
    }
    
    # Check Windows edition
    $osInfo = Get-WmiObject -Class Win32_OperatingSystem -ErrorAction SilentlyContinue
    $editionName = $osInfo.Caption
    $isHomeEdition = $editionName -like "*Home*"
    
    # If it's Windows Home, BitLocker is not available
    if ($isHomeEdition) {
        $result.status = $false
        return $result | ConvertTo-Json -Depth 3
    }
    
    # Check if BitLocker module is available
    $moduleAvailable = $false
    try {
        $bitlockerCommands = Get-Command -Module BitLocker -ErrorAction SilentlyContinue
        if ($bitlockerCommands) {
            $moduleAvailable = $true
        }
    } catch {
        # Don't show errors
    }
    
    # If module is not available, try alternative method with WMI
    if ($moduleAvailable) {
        try {
            # Use BitLocker cmdlet
            $volumes = Get-BitLockerVolume -ErrorAction SilentlyContinue
            
            foreach ($vol in $volumes) {
                $volName = ""
                try {
                    $volObj = Get-WmiObject -Query "SELECT * FROM Win32_Volume WHERE DriveLetter = '$($vol.MountPoint)'" -ErrorAction SilentlyContinue
                    if ($volObj) {
                        $volName = $volObj.Label
                    }
                } catch {
                    # Don't show errors
                }
                
                $volInfo = @{
                    letter = $vol.MountPoint
                    name = $volName
                    bitlocker = ($vol.VolumeStatus -eq "FullyEncrypted" -or $vol.VolumeStatus -eq "EncryptionInProgress")
                }
                $result.volumes += $volInfo
                
                # If any volume has BitLocker active, change the global status
                if ($volInfo.bitlocker) {
                    $result.status = $true
                }
            }
        } catch {
            # Don't show errors
        }
    } else {
        # Alternative method with WMI to verify BitLocker
        try {
            $volumes = Get-WmiObject -Namespace "Root\\cimv2\\Security\\MicrosoftVolumeEncryption" -Class "Win32_EncryptableVolume" -ErrorAction SilentlyContinue
            
            if ($volumes) {
                foreach ($vol in $volumes) {
                    $volName = ""
                    try {
                        $volObj = Get-WmiObject -Query "SELECT * FROM Win32_Volume WHERE DriveLetter = '$($vol.DriveLetter)'" -ErrorAction SilentlyContinue
                        if ($volObj) {
                            $volName = $volObj.Label
                        }
                    } catch {
                        # Don't show errors
                    }
                    
                    $volInfo = @{
                        letter = $vol.DriveLetter
                        name = $volName
                        bitlocker = ($vol.ProtectionStatus -eq 1)
                    }
                    $result.volumes += $volInfo
                    
                    # If any volume has BitLocker active, change the global status
                    if ($volInfo.bitlocker) {
                        $result.status = $true
                    }
                }
            }
        } catch {
            # Don't show errors
        }
    }
    
    # Add verification for volumes that don't appear in previous methods
    try {
        $allDrives = Get-PSDrive -PSProvider FileSystem -ErrorAction SilentlyContinue
        foreach ($drive in $allDrives) {
            $driveLetter = $drive.Name + ":"
            $existsInResult = $result.volumes | Where-Object { $_.letter -eq $driveLetter }
            
            if (-not $existsInResult) {
                $volName = ""
                try {
                    $volObj = Get-WmiObject -Query "SELECT * FROM Win32_Volume WHERE DriveLetter = '$driveLetter'" -ErrorAction SilentlyContinue
                    if ($volObj) {
                        $volName = $volObj.Label
                    }
                } catch {
                    # Don't show errors
                }
                
                $volInfo = @{
                    letter = $driveLetter
                    name = $volName
                    bitlocker = $false  # Assume false if not detected by previous methods
                }
                $result.volumes += $volInfo
            }
        }
    } catch {
        # Don't show errors
    }
    
    # Return result in JSON format
    return $result | ConvertTo-Json -Depth 3
}

# Ejecutar la función principal y mostrar solo el resultado JSON
Get-BitLockerStatus
`