$allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\CIMV2" | Where-Object { $_.ConfigManagerErrorCode -ne 0 }
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
        $allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\CIMV2" | Where-Object { $_.ConfigManagerErrorCode -ne 0 }

        $msgBody = "Please check that there are no missing drivers or problems with drivers."
        $msgTitle = "Device Manager Drivers Test"
        $msgButton = 'AbortRetryIgnore'
        $msgImage = 'Question'
        $result = [System.Windows.Forms.MessageBox]::Show($msgBody,$msgTitle,$msgButton,$msgImage)
        $resDriver = ($result).value__

        if ($resDriver -eq "3") {
            #Write-Host "    [NO] Missing Drivers" -ForegroundColor Red

            #$txtFileTest += "Device Manager Drivers Test FAIL`n"

            #net use W: \\10.2.198.145\logsFails /u:localhost\isptek YouCantRemote1!
            #New-Item $pathScript"logsFails\"$nameFailFileTest -Force
            #$txtFileTest += "complete time:"
            #$txtFileTest += Get-Date -Format "HH:mm:ss"
            #$txtFileTest += "`n=============================================================`nTest Result is FAIL"
            #Set-Content $pathScript"logsFails\"$nameFailFileTest $txtFileTest

            $errorInfo.errorMessage = "Missing Drivers"
            $errorInfo.estatusDrivers = "FAIL"
            $errorInfo.estatusVideo = ""
            $errorInfo.result = "FAIL"

            Write-Host ($errorInfo | ConvertTo-Json)
            exit
        }

        if ($resDriver -eq "5") {
            $txtFileTest += "Device Manager Drivers Test PASS`n"
            #Write-Host "    [OK] Drivers Installed" -ForegroundColor Green

            $errorInfo.estatusDrivers = "PASS"
            $errorInfo.result = "PASS"

            #Write-Host ($errorInfo | ConvertTo-Json)
            #break
        }

    } while ($resDriver -eq "4" -or $allDevices)

    #$txtFileTest += "Device Manager Drivers Test PASS`n"
    #Write-Host "      [OK] Drivers Installed" -ForegroundColor Green
} else {
    #$txtFileTest += "Device Manager Drivers Test PASS`n"
    #Write-Host "    [OK] Drivers Installed" -ForegroundColor Green

    $errorInfo.estatusDrivers = "PASS"
    $errorInfo.result = "PASS"

    #Write-Host ($errorInfo | ConvertTo-Json)
}

$driverError = $false

#Write-Host "`n     8.1 Display Adapter Verification Process"

$allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\CIMV2" | Where-Object { $_.Caption -eq "Microsoft Basic Display Adapter" -or $_.Caption -eq "Standard VGA Graphics Adapter" -or $_.Caption -eq "Video Controller (VGA Compatible)" }

Start-Process "devmgmt.msc"

if ($allDevices) {
    do {
        $driverError = $true
        Write-Host "     [NO] Missing Display Adapter Drivers" -ForegroundColor Red

        $allDevices = Get-WmiObject -Class Win32_PnPEntity -Namespace "Root\CIMV2" | Where-Object { $_.Caption -eq "Microsoft Basic Display Adapter" -or $_.Caption -eq "Standard VGA Graphics Adapter" -or $_.Caption -eq "Video Controller (VGA Compatible)" }

        $msgBody = "Verify that the display adapter drivers are installed. Do you want to check again?."
        $msgTitle = "Display Adapter Drivers Test"
        $msgButton = 'RetryCancel'
        $msgImage = 'Question'
        $result = [System.Windows.Forms.MessageBox]::Show($msgBody,$msgTitle,$msgButton,$msgImage)
        $resDriver = ($result).value__

        if ($resDriver -eq "2") {
            Write-Host ($errorInfo | ConvertTo-Json)
            exit
        }

    } while ($allDevices)

    $txtFileTest += "Display Adapter Drivers Test PASS`n"
    #Write-Host "      [OK] Display Adapter Drivers Installed" -ForegroundColor Green

    $errorInfo.estatusVideo = "PASS"
    $errorInfo.result = "PASS"
} else {
    $txtFileTest += "Display Adapter Drivers Test PASS`n"
    #Write-Host "      [OK] Display Adapter Drivers Installed" -ForegroundColor Green

    $errorInfo.estatusVideo = "PASS"
    $errorInfo.result = "PASS"

}

    Write-Host ($errorInfo | ConvertTo-Json)
