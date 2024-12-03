export default `
# Detener servicios relacionados con Windows Update y el almacenamiento reservado
Stop-Service -Name wuauserv -Force
Stop-Service -Name bits -Force
Stop-Service -Name trustedinstaller -Force

# Limpiar actualizaciones pendientes eliminando la carpeta de distribución de actualizaciones
Remove-Item -Path "C:\\Windows\\SoftwareDistribution" -Recurse -Force

# Desactivar el almacenamiento reservado
Disable-WindowsOptionalFeature -Online -FeatureName "ReservedStorage" -NoRestart

# Ejecutar Sysprep con OOBE y apagar el sistema
Start-Process -FilePath "C:\\Windows\\System32\\Sysprep\\Sysprep.exe" -ArgumentList "/oobe /shutdown" -NoNewWindow -Wait

`
