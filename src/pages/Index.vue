<template>
	<q-page id="test" class="" style="padding-top: 10px">
		<user-info-grid
			:username="user.usuario"
			:project="project.id"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
		/>
		<q-card class="card" v-if="activate.audio">
			<q-card-section> <div class="text-h6">Audio Test</div> </q-card-section><q-separator />
			<q-card-section class="reproductor-content">
				<q-card-section>
					<Reproductor
						ref="reproductorRef"
						id="audioTest"
						@respuesta="sound = $event"
						:autoplay="true"
					/>
				</q-card-section>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					id="audioFail"
					ref="audioFail"
					flat
					color="red"
					label="FAIL"
					@click="detenerReproduccion('fail')"
				/>
				<q-btn
					id="audioPass"
					ref="audioPass"
					flat
					color="green"
					label="PASS"
					@click="detenerReproduccion('pass')"
				/>
			</q-card-actions>
		</q-card>

		<q-card class="card" v-if="activate.camera">
			<q-card-section>
				<q-card-section> <div class="text-h6">Camera Test</div> </q-card-section><q-separator />
			</q-card-section>
			<q-card-section>
				<CameraCapture @capture-result="handleCaptureResult" :imageName="device.Serial" />
			</q-card-section>
			<q-card-actions align="right">
				<q-btn flat color="negative" label="Fail" @click="handleAction('fail')" />
				<q-btn flat color="positive" label="Pass" @click="handleAction('pass')" />
			</q-card-actions>
		</q-card>

		<q-card class="card" v-if="activate.brightness">
			<q-card-section>
				<q-card-section> <div class="text-h6">Brightness Test</div> </q-card-section><q-separator />
			</q-card-section>
			<q-card-section class="center"> Is the brightness working? </q-card-section>
			<q-card-actions align="right" v-if="showActions">
				<!-- <q-btn flat color="black" label="Repeat" @click="$cmd.executeScriptCode(getBrightness())" /> -->
				<q-btn
					flat
					color="negative"
					label="Fail"
					@click="test['brightness'] = 'Brightness test FAIL'"
				/>
				<q-btn
					flat
					color="positive"
					label="Pass"
					@click="test['brightness'] = 'Brightness test PASS'"
				/>
			</q-card-actions>
		</q-card>

		<q-card class="card" v-if="activate.drivers">
			<q-card-section>
				<q-card-section> <div class="text-h6">Drivers Test</div> </q-card-section><q-separator />
			</q-card-section>
			<q-card-section class="center"> Is the Drivers working? </q-card-section>
			<q-card-actions align="right">
				<!-- <q-btn flat color="black" label="Repeat" @click="$cmd.executeScriptCode(getBrightness())" /> -->
				<q-btn
					flat
					color="negative"
					label="Fail"
					@click="test['brightness'] = 'Brightness test FAIL'"
				/>
				<q-btn
					flat
					color="positive"
					label="Pass"
					@click="test['brightness'] = 'Brightness test PASS'"
				/>
			</q-card-actions>
		</q-card>

		<q-card class="card" v-if="activate.windows">
			<q-card-section>
				<q-card-section> <div class="text-h6">Windows Test</div> </q-card-section><q-separator />
			</q-card-section>
			<q-card-section class="center">
				<div>{{ win.os }}</div>
				<div>{{ win.keyWindows }}</div>
			</q-card-section>
			<q-card-actions align="right">
				<!-- <q-btn flat color="black" label="Repeat" @click="$cmd.executeScriptCode(getBrightness())" /> -->
				<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
				<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
			</q-card-actions>
		</q-card>

		<!-- <q-card class="card" v-if="activate.keyboard">
			<q-card-section>
				<q-card-section> <div class="text-h6">Keyboard Test</div> </q-card-section><q-separator />
			</q-card-section>
			<q-card-section>
				<keyboard />
			</q-card-section>
			<q-card-actions align="right">
				<q-btn color="negative" label="Fail" @click="handleAction('fail')" />
				<q-btn color="positive" label="Pass" @click="handleAction('pass')" />
			</q-card-actions>
		</q-card> -->
	</q-page>
</template>

<script>
	import UserInfoGrid from '../components/UserInfoGrid.vue'
	import Reproductor from '../components/soundTest.vue'
	import CameraCapture from '../components/camaraCapture.vue'
	import keyboard from '../components/keyboardTest.vue'
	import drivers from '../scripts/checkDrivers'
	import windows from '../scripts/checkWindows'
	import intenalDevices from '../scripts/hrvcInfo'
	export default {
		components: {
			UserInfoGrid,
			Reproductor,
			CameraCapture,
			keyboard,
		},
		data() {
			return {
				user: {},
				device: {},
				test: {},
				project: {},
				sound: 'nada',
				action: '',
				activate: {
					audio: false,
					camera: false,
					keyboard: true,
					brightness: false,
					drivers: false,
					windows: false,
				},
				showActions: false,
				win: {},
				intDev: {},
			}
		},
		methods: {
			getBrightness() {
				return `
        $brightnessMethods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods
    $maxBrightness = 100
    $minBrightness = 15
    $steps = 10
    for ($brightness = $maxBrightness; $brightness -ge $minBrightness; $brightness -= $maxBrightness / $steps) {
        $brightnessMethods.WmiSetBrightness(1, [int]$brightness)
        Start-Sleep -Milliseconds 400
    }
    for ($brightness = $minBrightness; $brightness -le $maxBrightness; $brightness += $maxBrightness / $steps) {
        $brightnessMethods.WmiSetBrightness(1, [int]$brightness)
        Start-Sleep -Milliseconds 400
    }
    Write-Host @{
      Status = 'end'
    }
        `
			},
			getDevice() {
				return `
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
			},
			getBattery() {
				return `
        $batteryPresent = Get-WmiObject -Class Win32_Battery

if ($batteryPresent) {
    $InfoAlertPercent = 80
    $WarnAlertPercent = 50
    $CritAlertPercent = 70
    $BatteryHealth = ""
    & powercfg /batteryreport /XML /OUTPUT "batteryreport.xml" | Out-null

    if (Test-Path $pathScript"batteryreport.xml") {
        Start-Sleep 1
        [xml]$b = Get-Content batteryreport.xml
        if ($b.BatteryReport.Batteries.childnodes.count -gt 0) {
            $batteryResults = @()
            $b.BatteryReport.Batteries |
            ForEach-Object {
                $batteryHealth = [math]::floor([int64]$_.Battery.FullChargeCapacity / [int64]$_.Battery.DesignCapacity * 100)
                $batteryResult = [PSCustomObject]@{
                    DesignCapacity = $_.Battery.DesignCapacity
                    FullChargeCapacity = $_.Battery.FullChargeCapacity
                    BatteryHealth = $batteryHealth
                    CycleCount = $_.Battery.CycleCount
                    ID = $_.Battery.id
                    Status = "pass"
                }
                $batteryResults += $batteryResult
                if ($batteryHealth -le $CritAlertPercent) {
                    $batteryResult.Status = "fail"
                }
            }
            $jsonResult = $batteryResults | ConvertTo-Json
            $jsonResult
        }
    }
    Remove-Item "batteryreport.xml" -Force | Out-Null
} else {
    $jsonResultNoBattery = @{
        Status = "NO BATTERY DETECTED"
    } | ConvertTo-Json
    $jsonResultNoBattery
}

        `
			},
			ramInfo(i) {
				let objetos = i.map((item) => {
					let [serialNumber, manufacturer, capacity, speed, ddrVersion] = item.split(',')

					let objeto = {
						SerialNumber: serialNumber.trim(),
						Manufacturer: manufacturer.trim(),
						Capacity: capacity.trim(),
						Speed: speed.trim(),
						DDRVersion: ddrVersion.trim(),
					}

					// Verificar si hay una descripción y agregarla al objeto
					if (item.includes('Description')) {
						let [, description] = item.match(/Description=([^;]*)/)
						objeto.Description = description.trim()
					}

					return objeto
				})

				let capacidadMap = new Map() // Mapa para realizar el seguimiento de la cantidad por variedad

				objetos.forEach((objeto) => {
					let { Capacity } = objeto
					let cantidad = capacidadMap.has(Capacity) ? capacidadMap.get(Capacity) + 1 : 1
					capacidadMap.set(Capacity, cantidad)
				})

				let total = [...capacidadMap.keys()]
					.reduce((acc, capacidad) => {
						let cantidad = capacidadMap.get(capacidad)
						return `${acc}${cantidad > 1 ? `, ${cantidad} x ${capacidad}` : `, 1 x ${capacidad}`}`
					}, '')
					.slice(2) // Eliminar la coma inicial

				let totalString = total ? ` (Total: ${total})` : ''

				let resultado = {
					Information: objetos,
					Total: totalString,
				}

				return resultado
			},
			hddInfo(informacion) {
				let discos = informacion.map((item) => {
					let [serial, description, size] = item.split(',')

					return {
						Serial: serial.trim(),
						Description: description.trim(),
						Size: size.trim(),
					}
				})

				let sizeMap = new Map() // Mapa para realizar el seguimiento de la cantidad por tamaño

				discos.forEach((disco) => {
					let { Size } = disco
					let cantidad = sizeMap.has(Size) ? sizeMap.get(Size) + 1 : 1
					sizeMap.set(Size, cantidad)
				})

				let total = [...sizeMap.keys()]
					.reduce((acc, size) => {
						let cantidad = sizeMap.get(size)
						return `${acc}${cantidad > 1 ? `, ${cantidad} x ${size}` : `, ${size}`}`
					}, '')
					.slice(2) // Eliminar la coma inicial

				let totalString = total ? ` (Total: ${total})` : ''

				let resultado = {
					Information: discos,
					Total: totalString,
				}

				return resultado
			},
			handleCaptureResult(result) {
				console.log(`Captura ${result ? 'exitosa' : 'fallida'}`)
				// Realizar acciones adicionales según el resultado de la captura
				if (result) {
					// Acciones después de una captura exitosa
				} else {
					// Acciones después de una captura fallida
				}
			},
			handleAction(action) {
				console.log(`${action} button clicked`)
				this.test['camera'] = `Webcam test ${action.toUpperCase()} `
				this.activate.camera = false
			},
			detenerReproduccion(r) {
				if (r == 'pass') {
					this.test['audio'] = 'Internal Speaker Test PASS '
					this.activate.audio = false
				} else if (r == 'fail') {
					this.test['audio'] = 'Internal Speaker Test FAIL '
					this.activate.audio = false
				}
				this.$refs.reproductorRef.detenerReproduccion(r)
			},
			DateTime() {
				const options = { method: 'GET' }
				return fetch('https://worldtimeapi.org/api/timezone/America/Chicago', options)
					.then((response) => response.json())
					.then((r) => {
						console.log(r)
						const date = r.datetime.split('T')[0]
						const time = r.datetime.split('T')[1]
						return {
							date: date,
							time: time,
							complete: r.datatime,
						}
					})
					.catch((err) => console.error(err))
			},
			espera(a) {
				return new Promise((resolve) => {
					document.addEventListener('click', function clicDelRaton() {
						document.removeEventListener('click', clicDelRaton)
						resolve()
					})
				})
			},
		},
		async beforeCreate() {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			console.log(this.user)
		},
		async mounted() {
			let getD = await this.getDevice()
			this.intDev = await this.$cmd.executeScriptCode(intenalDevices)
			await this.$cmd.executeScriptCode(getD).then(async (result) => {
				if (result == false) {
					console.error('Error ejecutando script:', error)
				} else {
					let battery = await this.$cmd.executeScriptCode(this.getBattery())
					console.log('randy: ', battery)
					let res = ''
					for (let x of this.$env.project) {
						let u = await this.$rsNeDB('credenciales').findOne({ tenant: x.id })
						console.log(u.tenant, x.db)
						res = await this.$rsDB(x.db)
							.select('SerialNumber, ArrivedSKU, StationID')
							.from('sfis_WorkTracking')
							.where(`SerialNumber = '${result.Serial}'`)
							.execute()
						if (res.length) {
							this.project['id'] = x.id
							this.project['db'] = x.db
							this.project['operator'] = u.id
							break
						}
					}
					if (!this.project.hasOwnProperty('id')) return (test['Serial'] = `SN ID Check FAIL`)
					if (!res[0].StationID == 15) return
					this.device = result
					let datetime = await this.DateTime()
					this.test['Date'] = datetime.date
					this.test['startTime'] = datetime.time
					this.test['Serial'] = `SN ID Check PASS, SNID: ${this.device.Serial}`
					if (this.device.SKU == res[0].ArrivedSKU)
						this.test['Model'] = `Model (SKU ID) Check PASS, SKUID: ${this.device.SKU}`
					this.test['Description'] = `Product Description: ${this.device.Description}`
					this.activate.audio = true
					await this.espera()
					this.activate.camera = true
					await this.espera()
					this.test['battery'] = battery.Status.includes('pass')
						? `Battery test PASS, Design Capacity = ${battery.DesignCapacity}, Full Charge Capacity= ${battery.FullChargeCapacity}, Battery Health= ${battery.BatteryHealth}%, Cycle Count= ${battery.CycleCount} ID= ${battery.ID}`
						: `Battery test FAIL`

					this.activate.brightness = true
					this.$cmd.executeScriptCode(this.getBrightness())
					setTimeout(() => {
						this.showActions = true
					}, 4000)
					await this.espera()
					this.activate.brightness = false
					let driver = await this.$cmd.executeScriptCode(drivers)
					this.activate.drivers = true
					console.log('randy: ', driver)
					await this.espera()
					if (driver.estatusDrivers == 'PASS') this.test['drivers'] = 'Device Manager Drivers Test PASS'
					else this.test['drivers'] = 'Device Manager Drivers Test FAIL'
					if (driver.estatusDrivers == 'PASS') this.test['display'] = 'Display Adapter Drivers Test PASS'
					else this.test['display'] = 'Display Adapter Drivers Test FAIL'
					this.activate.drivers = false
					this.win = await this.$cmd.executeScriptCode(windows)
					this.activate.windows = true
					console.log('randy: ', this.win)
					await this.espera()
					this.activate.windows = false
					if (this.action == 'PASS' && this.win.activationStatus)
						this.test['windows'] = 'Windows Activation Test PASS'
					else this.test['windows'] = 'Windows Activation Test FAIL'
					this.test['OS'] = this.win.os
					this.test['keyWindows'] = this.win.keyWindows
					console.log(this.test, this.intDev)

					await this.$uploadTextFile(this.device.Serial, this.test)
				}
			})
		},
	}
</script>
<style scoped>
	.card {
		border-radius: 15px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 90%;
		position: relative;
		margin-top: 25px;
	}
	.q-card-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
