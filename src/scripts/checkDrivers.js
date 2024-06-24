export default `
# Cargar ensamblado de Windows Forms
Add-Type -AssemblyName System.Windows.Forms

# Obtener todos los dispositivos con errores
$allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\\CIMV2" | Where-Object { $_.ConfigManagerErrorCode -ne 0 }
Start-Process "devmgmt.msc"
$errorInfo = @{
    errorMessage = ""
    estatusDrivers = ""
    estatusVideo = ""
    result = ""
}
if ($allDevices) {
    $driverError = $true
    Write-Host "    [NO] Missing Drivers" -ForegroundColor Red
    do {
        $allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\\CIMV2" | Where-Object { $_.ConfigManagerErrorCode -ne 0 }
        $msgBody = "Please check that there are no missing drivers or problems with drivers."
        $msgTitle = "Device Manager Drivers Test"
        $msgButton = [System.Windows.Forms.MessageBoxButtons]::AbortRetryIgnore
        $msgImage = [System.Windows.Forms.MessageBoxIcon]::Question
        $result = [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
        $resDriver = ($result).value__
        if ($resDriver -eq "3") {  # Abort
            $errorInfo.errorMessage = "Missing Drivers"
            $errorInfo.estatusDrivers = "FAIL"
            $errorInfo.estatusVideo = ""
            $errorInfo.result = "FAIL"
            Write-Host ($errorInfo | ConvertTo-Json)
            exit
        }
        if ($resDriver -eq "5") {  # Ignore
            $errorInfo.estatusDrivers = "PASS"
            $errorInfo.result = "PASS"
        }
    } while ($resDriver -eq "4" -or $allDevices)  # Retry or continue checking if there are devices with errors
} else {
    $errorInfo.estatusDrivers = "PASS"
    $errorInfo.result = "PASS"
}
$driverError = $false
$allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\\CIMV2" | Where-Object { $_.Caption -eq "Microsoft Basic Display Adapter" -or $_.Caption -eq "Standard VGA Graphics Adapter" -or $_.Caption -eq "Video Controller (VGA Compatible)" }
#Start-Process "devmgmt.msc"
if ($allDevices) {
    do {
        $driverError = $true
        Write-Host "     [NO] Missing Display Adapter Drivers" -ForegroundColor Red

        $allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\\CIMV2" | Where-Object { $_.Caption -eq "Microsoft Basic Display Adapter" -or $_.Caption -eq "Standard VGA Graphics Adapter" -or $_.Caption -eq "Video Controller (VGA Compatible)" }

        $msgBody = "Verify that the display adapter drivers are installed. Do you want to check again?."
        $msgTitle = "Display Adapter Drivers Test"
        $msgButton = [System.Windows.Forms.MessageBoxButtons]::RetryCancel
        $msgImage = [System.Windows.Forms.MessageBoxIcon]::Question
        $result = [System.Windows.Forms.MessageBox]::Show($msgBody, $msgTitle, $msgButton, $msgImage)
        $resDriver = ($result).value__

        if ($resDriver -eq "2") {  # Cancel
            Write-Host ($errorInfo | ConvertTo-Json)
            exit
        }

    } while ($allDevices)  # Continue checking if there are devices with errors
    $errorInfo.estatusVideo = "PASS"
    $errorInfo.result = "PASS"
} else {
    $errorInfo.estatusVideo = "PASS"
    $errorInfo.result = "PASS"
}
Write-Host ($errorInfo | ConvertTo-Json)

`
