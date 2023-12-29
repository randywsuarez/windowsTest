$Information = @{
    cpu = @()
    cpuName = @()
    video = @()  # Inicializamos como un array
    RAM = @{
        Total = ""
        Modules = @()
    }
    HDD = @{
        Total = ""
        Units = @()
    }
}
function ConvertBytesToStandardSize {
    param (
        [Parameter(Mandatory=$true)]
        [long]$Bytes
    )

    $standardSizes = @(34359738368, 68719476736, 137438953472, 274877906944, 549755813888, 1099511627776, 2199023255552, 4398046511104, 8796093022208)
    $closestSize = $standardSizes[0]  # Inicializa con el primer tamaño estándar
    $minDiff = [math]::Abs($Bytes - $closestSize)

    foreach ($size in $standardSizes) {
        $diff = [math]::Abs($Bytes - $size)

        if ($diff -lt $minDiff) {
            $closestSize = $size
            $minDiff = $diff
        }
    }

    if ($closestSize -gt 549755813888) {
        $closestSize = $closestSize / (1024*1024*1024*1024)
        return "$closestSize TB"
    } else {
        $closestSize = $closestSize / (1024*1024*1024)
        return "$closestSize GB"
    }
}

# Obtener información de la CPU
$cpus = Get-WmiObject -Class Win32_Processor

foreach ($cpu in $cpus) {
    $Information.cpuName += $cpu.Name
    $Information.cpu += "$($cpu.Name) ($($cpu.MaxClockSpeed) GHz, $($cpu.L3CacheSize) MB L3 cache, $($cpu.NumberOfCores) cores, $($cpu.NumberOfLogicalProcessors) threads)"
}

# Obtener solo las tarjetas de video reales
$videoControllers = Get-WmiObject -Class Win32_VideoController | Where-Object { $_.VideoProcessor -notmatch "RDP" } | Select-Object Description, AdapterRAM

# Verificamos si hay al menos una tarjeta de video
if ($videoControllers) {
    $counter = 1
    foreach ($controller in $videoControllers) {
        $adapterRAMBytes = $controller.AdapterRAM
        $adapterRAMMB = [Math]::Round($adapterRAMBytes / 1MB, 2)

        # Si la cantidad es 0.5 GB, convertirla a 512 MB
        if ($adapterRAMMB -eq 0.5) {
            $adapterRAMMB = 512
        }

        # Determinar si mostrar en MB o GB
        $adapterRAMFormatted = if ($adapterRAMMB -lt 1024) {
            "$adapterRAMMB MB"
        } else {
            "$([Math]::Round($adapterRAMMB / 1024, 2)) GB"
        }

        # Creamos un objeto para cada tarjeta de video
        $videoInfo = [PSCustomObject]@{
            Description = $controller.Description
            AdapterRAM = $adapterRAMFormatted
        }

        # Agregamos el objeto al array
        $Information.video += $videoInfo
        $counter++
    }
}

# Obtener información de la RAM
$ramModules = Get-WmiObject -Class Win32_PhysicalMemory
$ramDescArray = @()
$ramTotalGB = 0
$ramSerialNumbers = @{}
$ramCapacityCounts = @{}
foreach ($ram in $ramModules) {
    $manufacturer = $ram.Manufacturer
    $capacityGB = [math]::Round($ram.Capacity / 1GB)
    $ramTotalGB += $capacityGB
    $speed = $ram.Speed
    $memoryType = $ram.MemoryType
    $ddrVersion = ""
    if ($speed -gt 1000) {
        $ddrVersion = "DDR4"
    } elseif ($speed -gt 667) {
        $ddrVersion = "DDR3"
    } else {
        $ddrVersion = "DDR2 o anterior"
    }

    $ramDesc = "$capacityGB GB $ddrVersion"
    $ramSerialNumber = $ram.SerialNumber

    # Contar la cantidad de módulos por capacidad
    if ($ramCapacityCounts.ContainsKey($capacityGB)) {
        $ramCapacityCounts[$capacityGB]++
    } else {
        $ramCapacityCounts[$capacityGB] = 1
    }

    # Agregar descripción al array de descripciones
    $ramDescArray += @{
        SerialNumber = $ramSerialNumber
        Description = "$capacityGB GB"
        Details = "$manufacturer, $capacityGB GB, $speed MHz, $ddrVersion"
    }

    # Agregar número de serie al array de números de serie
    $ramSerialNumbers[$ramSerialNumber] = $null
}

# Construir la descripción total de RAM
$ramTotalDesc = "$ramTotalGB GB ("
$ramDetailsArray = @()
foreach ($capacityGB in $ramCapacityCounts.Keys) {
    $count = $ramCapacityCounts[$capacityGB]
    $ramDetails = "$count x $capacityGB GB"
    $ramDetailsArray += $ramDetails
}
$ramTotalDesc += ($ramDetailsArray -join ", ") + ")"

# Agregar información de RAM al objeto
#$Information.RAM.Total = $ramTotalDesc
$Information.RAM.Total = "$ramTotalGB GB"
$Information.RAM.Modules = @($ramDescArray | ForEach-Object { "$($_.SerialNumber),$($_.Details)" })

$hddUnits = Get-WmiObject -Class Win32_DiskDrive | Where-Object { $_.MediaType -ne "Removable Media" } | Select-Object Size, Model, SerialNumber


if ($hddUnits) {
    $totalHDDSize = 0
    $hddUnitArray = @()

    foreach ($unit in $hddUnits) {
        $hddSize = ConvertBytesToStandardSize -Bytes $unit.Size
        $totalHDDSize += $unit.Size

        $hddInfo = @{
            Model = $unit.Model
            Size = $hddSize
            Serial = $unit.SerialNumber
        }

        $hddUnitArray += "$($hddInfo.Serial),$($hddInfo.Model),$($hddInfo.Size)"
    }

    $Information.HDD.Total = ConvertBytesToStandardSize -Bytes $totalHDDSize
    $Information.HDD.Units = $hddUnitArray
    #$Information.HDD.Units = "$($cpu.Name)"
}
Write-Host ($hddUnitArray | ConvertTo-Json)
# Convertir a JSON y mostrar el resultado
Write-Host ($Information | ConvertTo-Json)
