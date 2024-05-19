export default `
$dispositivos = Get-PnpDevice | Where-Object {$_.Class -eq "HIDClass" -and $_.FriendlyName -like "*touch screen*"}

# Verifica si se encontraron dispositivos táctiles
if ($dispositivos) {
    $result = @{
        result = 'YES'
    } | ConvertTo-Json
} else {
    $result = @{
        result = 'NO'
    } | ConvertTo-Json
}
$result
`
