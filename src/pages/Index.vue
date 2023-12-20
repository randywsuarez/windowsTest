<template>
	<q-page id="test" class="" style="padding-top: 10px">
		<user-info-grid
			:username="user.usuario"
			:project="project.id"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
		/>
		<div class="main">
			<q-card class="card" v-show="activate.audio">
				<q-card-section> <div class="text-h6">Audio Test</div> </q-card-section><q-separator />
				<q-card-section class="reproductor-content">
					<q-card-section>
						<Reproductor
							v-if="activate.audio"
							ref="reproductorRef"
							id="audioTest"
							@respuesta="sound = $event"
							:autoplay="true"
						/>
					</q-card-section>
				</q-card-section>

				<q-card-actions align="right" ref="actionAudio" id="actionAudio">
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
			<q-card class="card" v-show="activate.camera">
				<q-card-section>
					<q-card-section> <div class="text-h6">Camera Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section>
					<CameraCapture
						@capture-result="handleCaptureResult"
						:imageName="device.Serial"
						v-if="activate.camera"
					/>
				</q-card-section>
				<q-card-actions align="right" id="actionCamera">
					<q-btn flat color="negative" label="Fail" @click="test['camera'] = 'Webcam test FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="test['camera'] = 'Webcam test PASS'" />
				</q-card-actions>
			</q-card>

			<q-card class="card" v-show="activate.brightness">
				<q-card-section>
					<q-card-section> <div class="text-h6">Brightness Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center"> Is the brightness working? </q-card-section>
				<q-card-actions align="right" v-show="showActions" id="actionBrightness">
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

			<q-card class="card" v-show="activate.drivers">
				<q-card-section>
					<q-card-section> <div class="text-h6">Drivers Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					Is the Drivers and Video working?
					<div>Driver: {{ driver.estatusDrivers }}</div>
					<div>Video: {{ driver.estatusVideo }}</div>
				</q-card-section>
				<q-card-actions align="right" id="actionDrivers">
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

			<q-card class="card" v-show="activate.windows">
				<q-card-section>
					<q-card-section> <div class="text-h6">Windows Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div>{{ win.os }}</div>
					<div>{{ win.keyWindows }}</div>
				</q-card-section>
				<q-card-actions align="right" id="actionWindows">
					<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.battery">
				<q-card-section>
					<q-card-section> <div class="text-h6">Battery Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div>{{ win.os }}</div>
					<div>{{ win.keyWindows }}</div>
				</q-card-section>
				<q-card-actions align="right" id="actionBattery">
					<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.gpu">
				<q-card-section>
					<q-card-section> <div class="text-h6">GPU Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div>{{ win.os }}</div>
					<div>{{ win.keyWindows }}</div>
				</q-card-section>
				<q-card-actions align="right" id="actionBattery">
					<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
		</div>

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
	import getBattery from '../scripts/battery'
	import getDeviceInfo from '../scripts/GetDeviceInfo'
	import GetMntBringhtness from '../scripts/MonitorBrightness'
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
					battery: false,
					gpu: false,
				},
				showActions: false,
				win: {},
				intDev: {},
				getDev: {},
				driver: {},
				select: {},
				file: '',
				myDb: {
					test_SnResultsID: '',
					Serial: '',
					Model: '',
					Serial_HDD: '',
					Model_HDD: '',
					DATE: '',
					STATUS: '',
					RAM: '',
					GPU: '',
					OS: '',
					GPU_RAM: '',
					OPERATOR: '',
					HDD_CAPACITY: '',
					COLOR: '',
					CPU: '',
					Description: '',
					DateStart: '',
					DateEnd: '',
				},
			}
		},
		methods: {
			async report() {
				let res = Object.values(this.test).includes('fail') ? 'FAIL' : 'PASS'
				let lastdate = await this.DateTime()
				return `
        ISP Windows Test Ver:3.00
        Operator ID: ${this.user.id}
        Operator Name:${this.user.usuario}
        Start Date: ${this.test.Date}
        Start Time: ${this.test.startTime}
        End Date: ${lastdate.date}
        End Time: ${lastdate.time}
        ==============================Devices Information===================================
        ${this.test.Description}
        ${this.test.Model}
        ${this.test.Serial}
        Windows OS Name: ${this.test.OS}
        Windows Product Key: ${this.test.keyWindows}
        ${this.test.windows}
        Hard Drive: ${this.intDev.HDD.Total}
        ${this.intDev.HDD.Units.join('\n')}
        Memory RAM: ${this.intDev.RAM.Total}
        ${this.intDev.RAM.Modules.join('\n')}
        GPU Verification PASS
        ${this.intDev.video.map((v) => `${v.Description} ${v.AdapterRAM}`)}
        CPU
        ${this.intDev.cpu}
        =================================Test Status========================================
        ${this.test.audio}
        ${this.test.camera}
        ${this.test.drivers}
        ${this.test.display}
        ${this.test.battery}
        ${this.test.brightness}
        ====================================Result==========================================
        Test Result is ${res}
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
				this.$children[0].$emit('stopCamera')
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
			async espera(a) {
				return new Promise((resolve) => {
					const cardActions = document.querySelector(`#${a}`) // Cambia '.card-actions' por el selector adecuado

					const clickHandler = (event) => {
						console.log(a, event.target.innerText)
						const target = event.target
						if (target.innerText === 'PASS' || target.innerText === 'FAIL') {
							cardActions.removeEventListener('click', clickHandler)
							resolve()
						}
					}

					cardActions.addEventListener('click', clickHandler)
				})
			},
			async rsSave() {
				let sh = await this.$rsDB(this.select.db)
					.select('Serial')
					.from('test_SnResults')
					.where(`Serial = '${this.device.Serial}'`)
					.execute()
				if (sh.length) {
					console.log(sh)
					let result = this.$rsDB(this.select.db)
						.update('test_SnResults')
						.set({})
						.where(`Serial = '${this.device.Serial}'`)
						.execute()
				} else {
					let result = await this.$rsDB('nombre-de-la-base-de-datos')
						.insert('test_SnResults')
						.fields({ campo1: 'valor1', campo2: 'valor2' })
						.execute()
				}
			},
			async upload(file, serial, type) {
				const form = new FormData()
				form.append(
					'',
					'C:\\Users\\rwsr\\OneDrive - IspTekServices\\shared\\Test\\logsPass\\5CD145GY24_43N62UA#ABA_Pass.log'
				)

				const options = {
					method: 'POST',
					headers: {
						cookie:
							'.AspNetCore.Identity.Application=CfDJ8Cxxq86nzJFBvhGy7wbkkRbCdg75OCdp_FhHe51Lf0HqlKmLG7m90LPxH2yNF5z6GCuGLsq76VibegJZJhMhvT9fUic9GtnpATmeI0YfWTcvxdIuAM5eqLJs0ELESNperl_99n9WZZUiSqYg_wfh_mivHAbp8EAoQAFBTULxOC_KujrLvT8IgbKdyirlqV0tBiXp5Qi9RwYOoCw0VS5jFJjbNhA726Txx7bq0C6b5WHK2xrqQi-VwCbq1ji9_2lITC9h_MntfQZQpps4oVE7C02UXGr1gXgkNkw42PGM3DBxIEhcAubd3oy9XFT65edR-FiyCEkRKSzMJxXRPrwtyXGhrzzxRZztTgujg8jUdbDEsfnSTeRPyX3rixJkDotyp6TfwxqgKtwbPa172BMRnD6cXX6Z_WJwmbMdJyk6cq7Hm3V9RVDGje7e-1hzuIFPunAlLSLk9HrC971oKt6bpu0pnE8q23xtbYF_OSh3qTsGyj039P_LaL4FhoQcCgWg4iFosZ1zfry7s-jsCwxaA_JqGecri3oQWoVcE1Fa4m8iLdjZVUeeikkuDedKfi1XN2Ad8hSpIpbdO8u8oZOq3mMgn_OgerBtMX4Urv13VdfaTUtYhCNpu-1D8bYcM8j7DOrgxiW4QYvBM5uFYvWAvYNc1wIFRyb9Jn4VBkchrPPAUczEfeeci5tFUXrpCE_NtsZL2JCb5v6n5YzLsle8qOjv-zOiiddSFgOdCzIlRibrQGEEOidjvzDXAOimjWX3aN40fOWrb7RZ7Kd1LLzO8Hw3xMN5rlDjDhAhtzUQoMxvw4PMJDXQmB7Dq0NLADd36YW_gL578TP1_UpVzjrOS0A; ARRAffinity=32b86a1d14140b24bde88b7fd630b5ce6e301a4c0624226b941643661531cc59; ARRAffinitySameSite=32b86a1d14140b24bde88b7fd630b5ce6e301a4c0624226b941643661531cc59',
						'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
						'User-Agent': 'insomnia/2023.5.8',
						tenant: 'HPRefurbish',
						Authorization:
							'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoicmFuZHkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiBSb2xlIiwiZXhwIjoxNzMzMzQ5NDg2LCJpc3MiOiJTRklTIn0.ZA9K7nTkVOfzifRMFoKj9oE4Pl9UUKTXfZqjvH61t2A',
					},
				}

				options.body = form

				fetch(
					'https://sfiswebwebdev.azurewebsites.net/api/Testing/TestFilesResultsUpload/UploadFile?SerialNumber=5CD30248DB&EmployeeID=753e9471-ba01-4877-8dc3-763fdf90213c&FileType=1',
					options
				)
					.then((response) => response.json())
					.then((response) => console.log(response))
					.catch((err) => console.error(err))
			},
		},
		async beforeCreate() {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			//this.getDev = await this.$cmd.executeScriptCode(getDeviceInfo)
			console.log(this.user, this.getDev)
		},
		async mounted() {
			this.intDev = await this.$cmd.executeScriptCode(intenalDevices)
			await this.$cmd.executeScriptCode(getDeviceInfo).then(async (result) => {
				if (result == false) {
					console.error('Error ejecutando script:', error)
				} else {
					let battery = await this.$cmd.executeScriptCode(getBattery)
					let res = ''
					for (let x of this.$env.project) {
						let u = await this.$rsNeDB('credenciales').findOne({ tenant: x.id })
						res = await this.$rsDB(x.db)
							.select('SerialNumber, ArrivedSKU, StationID')
							.from('sfis_WorkTracking')
							.where(`SerialNumber = '${result.Serial}'`)
							.execute()
						if (res.length) {
							this.project['id'] = x.id
							this.project['db'] = x.db
							this.project['operator'] = u.id
							this.select = { ...x, ...u }
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
					await this.espera('actionAudio')
					this.activate.camera = true
					await this.espera('actionCamera')
					this.activate.camera = false
					this.test['battery'] = battery.Status.includes('pass')
						? `Battery test PASS, Design Capacity = ${battery.DesignCapacity}, Full Charge Capacity= ${battery.FullChargeCapacity}, Battery Health= ${battery.BatteryHealth}%, Cycle Count= ${battery.CycleCount} ID= ${battery.ID}`
						: `Battery test FAIL`

					this.activate.brightness = true
					this.$cmd.executeScriptCode(GetMntBringhtness)
					setTimeout(() => {
						this.showActions = true
					}, 4000)
					await this.espera('actionBrightness')
					this.activate.brightness = false
					this.driver = await this.$cmd.executeScriptCode(drivers)
					this.activate.drivers = true
					await this.espera('actionDrivers')
					if (this.driver.estatusDrivers == 'PASS')
						this.test['drivers'] = 'Device Manager Drivers Test PASS'
					else this.test['drivers'] = 'Device Manager Drivers Test FAIL'
					if (this.driver.estatusVideo == 'PASS')
						this.test['display'] = 'Display Adapter Drivers Test PASS'
					else this.test['display'] = 'Display Adapter Drivers Test FAIL'
					this.activate.drivers = false
					this.win = await this.$cmd.executeScriptCode(windows)
					this.activate.windows = true
					await this.espera('actionWindows')
					this.activate.windows = false
					if (this.action == 'PASS' && this.win.activationStatus)
						this.test['windows'] = 'Windows Activation Test PASS'
					else this.test['windows'] = 'Windows Activation Test FAIL'
					this.test['OS'] = this.win.os
					this.test['keyWindows'] = this.win.keyWindows
					let txt = await this.report()
					this.file = await this.$uploadTextFile(this.device.Serial, txt)
					console.log(this.$textFile, this.$imageFile)
					console.log(sessionStorage.getItem('image'), sessionStorage.getItem('txt'))
					//this.rsSave()
				}
			})
		},
	}
</script>
<style scoped>
	.main {
		display: flex;
		justify-content: center;
	}
	.card {
		border-radius: 15px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 90%;
		margin-top: 25px;
	}
	.q-card-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
