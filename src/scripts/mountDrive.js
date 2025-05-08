export default `powershell
# --- Network drive configuration ---
$netPath  = "\\dalmdt01\\Production_Scripts\\WindowsTest"
$user     = "mdt_Admin"
$plainPwd = "isp6060#"

$ErrorActionPreference = 'Stop'

try {
    # --- If already mounted, remove it ---
    if (Get-PSDrive -Name "R" -ErrorAction SilentlyContinue) {
        cmd /c "net use R: /delete /yes" | Out-Null
        Start-Sleep -Seconds 1
    }

    # --- Mount drive using net use with persistent credentials ---
    $mountCommand = "net use R: \`"$netPath\`" $plainPwd /user:$user /persistent:yes"
    cmd /c $mountCommand | Out-Null

    $result = [PSCustomObject]@{
        status   = "success"
        action   = "mount"
        message  = "Drive R: successfully mounted with persistent credentials."
        time     = (Get-Date).ToString("s")
        drive    = "R:"
        path     = $netPath
    }
} catch {
    $result = [PSCustomObject]@{
        status   = "error"
        action   = "mount"
        message  = $_.Exception.Message
        time     = (Get-Date).ToString("s")
    }
}

$result | ConvertTo-Json -Compress`