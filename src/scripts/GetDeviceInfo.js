export default `
$description = (Get-WmiObject win32_computerSystem).Model
if (-not $description) {
    $description = "#NA"
}
$serial = (Get-WmiObject -Class Win32_BIOS).SerialNumber
$sku = (Get-WmiObject win32_computerSystem).SystemSKUNumber
$deviceInfo = @{
    Description = $description
    Serial = $serial
    SKU = $sku
}

$deviceInfoJson = $deviceInfo | ConvertTo-Json
$deviceInfoJson
`
