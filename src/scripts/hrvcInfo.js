export default `
$Information = @{
    cpu = @()
    cpuName = @()
    video = @()
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
    $Information.cpu += $cpu.Name
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
        SerialNumber = $ram.SerialNumber
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
$Information.RAM.Total = "$ramTotalGB GB"
$Information.RAM.Modules = @($ramDescArray | ForEach-Object { "$($_.SerialNumber),$($_.Details)" })

# Obtener información de los discos duros usando Get-PhysicalDisk y excluyendo discos USB
$physicalHddUnits = Get-PhysicalDisk | Where-Object { $_.BusType -ne 'USB' } | Select-Object SerialNumber, MediaType, BusType, Size, DeviceID, Model

if ($physicalHddUnits) {
    $totalHDDSize = 0
    $hddUnitArray = @()
    $diskUnitArray = @()

    foreach ($unit in $physicalHddUnits) {
        $hddSize = ConvertBytesToStandardSize -Bytes $unit.Size
        $totalHDDSize += $unit.Size

        $diskType = if ($unit.MediaType) {
            $unit.MediaType
        } else {
            "Unknown"
        }
        $busType = if ($unit.BusType) {
            $unit.BusType
        } else {
            ""
        }

        $hddInfo = @{
            Model = $unit.Model
            Size = $hddSize
            Serial = $unit.SerialNumber
            Type = $diskType
            BusType = $busType
        }

        # Construir la cadena dependiendo si el BusType está definido
        $busTypeString = if ($busType) { " $busType" } else { "" }
        $hddUnitArray += "$($hddInfo.Serial),$($hddInfo.Model),$($hddInfo.Size) $($diskType)$busTypeString"
        $diskUnitArray += "$($hddSize) $($diskType)$busTypeString"
    }

    $Information.HDD.Total = ConvertBytesToStandardSize -Bytes $totalHDDSize
    $Information.HDD.Units = $hddUnitArray
    $Information.HDD.Disks = $diskUnitArray
}

# Obtener todas las tarjetas de video
$videoControllers = Get-WmiObject -Class Win32_VideoController

foreach ($controller in $videoControllers) {
    if ($controller.Description -notmatch "USB") {
        $adapterRAMBytes = $controller.AdapterRAM
        $adapterRAMMB = [Math]::Round($adapterRAMBytes / 1MB, 2)
        if ($adapterRAMMB -eq 0.5) {
            $adapterRAMMB = 512
        }
        $adapterRAMFormatted = if ($adapterRAMMB -lt 1024) {
            "$adapterRAMMB MB"
        } else {
            "$([Math]::Round($adapterRAMMB / 1024, 2)) GB"
        }
        $videoInfo = @{
            Description = $controller.Description
            AdapterRAM = $adapterRAMFormatted
            AdapterDACType = $controller.AdapterDACType
            Type = if ($controller.AdapterDACType -eq "Internal") { "Integrated" } elseif ($controller.AdapterDACType -eq "Integrated RAMDAC") { "Dedicated" } else { "Integrated" }
        }

        $Information.video += $videoInfo
    }
}

# Convertir a JSON y mostrar el resultado
$InformationJson = $Information | ConvertTo-Json -Depth 4
Write-Host $InformationJson

`
