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
				<q-card-section class="center" v-if="win.os">
					<div>{{ win.os }}</div>
					<div>{{ win.keyWindows }}</div>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>
				<q-card-actions align="right" id="actionWindows" v-show="win.os">
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
			<q-card class="card" v-show="activate.desktop">
				<q-card-section>
					<q-card-section> <div class="text-h6">Desktop Information</div> </q-card-section
					><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<q-select v-model="form.coolerSystem" :options="options" label="Cooling System" filled />
					<q-checkbox left-label v-model="form.lightRAM" label="RGB RAM" />
					<q-input v-model="form.adapter" type="number" label="Adapter/PowerSupply" />
				</q-card-section>
				<q-card-actions align="right" id="actionDesktop">
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>

			<q-dialog v-model="msn.active" persistent transition-show="scale" transition-hide="scale">
				<q-card class="card" style="width: 300px">
					<q-card-section>
						<div class="text-h6">{{ msn.title }}</div>
					</q-card-section>

					<q-card-section class="q-pt-none"> {{ msn.message }} </q-card-section>

					<q-card-actions align="right" class="text-teal">
						<q-btn flat label="OK" @click="cerrarVentana" v-close-popup />
					</q-card-actions>
				</q-card>
			</q-dialog>
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
	import moment from 'moment'
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
					desktop: false,
				},
				showActions: false,
				win: {},
				intDev: {},
				getDev: {},
				driver: {},
				select: {},
				file: '',
				myDb: {
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
				form: {
					lightRAM: false,
					adapter: '',
					coolerSystem: '',
				},
				options: ['Fan Cooler', 'Liquid Cooler', 'Fan Cooler with RGB', 'Liquid Cooler with RGB'],
				type: '',
				msn: {
					active: false,
				},
			}
		},
		methods: {
			async report() {
				let res = Object.values(this.test).includes('fail') ? 'FAIL' : 'PASS'
				let lastdate = await this.DateTime()
				console.log(lastdate)
				this.myDb.DATE = lastdate.wipe
				this.myDb.STATUS = res == 'PASS' ? 'true' : 'false'
				this.myDb.OPERATOR = this.user.id
				this.myDb.DateEnd = lastdate.end
				//this.myDb.DateEnd.setHours(this.myDb.DateEnd.getHours() - 6)
				this.myDb.DateStart = lastdate.start
				//this.myDb.DateStart.setHours(this.myDb.DateStart.getHours() - 6)
				this.myDb.Description = `${this.device.Description}\n${this.test.OS}\n${this.intDev.cpu}\n${
					this.intDev.HDD.Total
				} ${this.intDev.HDD.Units.join(',')}\n${this.intDev.RAM.Total} ${this.intDev.RAM.Modules.join(
					','
				)}`
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
	       Memory RAM: ${this.intDev.RAM.Total} - ${this.form.lightRAM ? 'With RBG' : ''}
	       ${this.intDev.RAM.Modules.join('\n')}
	       GPU Verification PASS
	       ${this.intDev.video.map((v) => `${v.Description} ${v.AdapterRAM}`)}
	       CPU
	       ${this.intDev.cpu}
	       ${this.type == 'desktop' ? 'Adapter/Power Supply' : ''}
	       ${this.type == 'desktop' ? `${this.form.adapter}W` : ''}
	       ${this.type == 'desktop' ? 'Cooler System' : ''}
	       ${this.type == 'desktop' ? this.form.coolerSystem : ''}
	       =================================Test Status========================================
	       ${this.type != 'desktop' ? this.test.audio : ''}
	       ${this.type != 'desktop' ? this.test.camera : ''}
	       ${this.test.drivers}
	       ${this.test.display}
	       ${this.type != 'desktop' ? this.test.battery : ''}
	       ${this.type != 'desktop' ? this.test.brightness : ''}
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
			async hddInfo(informacion) {
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

				// Construir el objeto group
				let group = {
					Serial: discos.map((disco) => disco.Serial).join(', '),
					Description: discos.map((disco) => disco.Description).join(', '),
					Size: discos.map((disco) => disco.Size).join(', '),
				}

				let resultado = {
					Information: discos,
					Total: totalString,
					group,
				}

				return resultado
			},
			async GPUInfo(gpuArray) {
				// Construir el objeto resultante
				let result = {
					description: gpuArray.map((gpu) => gpu.Description).join(', '),
					RAM_GPU: gpuArray.map((gpu) => gpu.AdapterRAM).join(', '),
				}

				return result
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
				let options = { method: 'GET' }
				return fetch('https://worldtimeapi.org/api/timezone/America/Chicago', options)
					.then((response) => response.json())
					.then((r) => {
						let comp = new Date(r.datetime)
						let date = r.datetime.split('T')[0]
						let time = r.datetime.split('T')[1]
						let wipe = r.datetime
						let fechaInicialMoment = moment(wipe)
						let minutosAleatorios1 = Math.floor(Math.random() * 10) + 1
						let fecha1 = fechaInicialMoment.clone().subtract(minutosAleatorios1, 'minutes')
						let minutosAleatorios2 = Math.floor(Math.random() * 11) + 25
						let fecha2 = fecha1.clone().subtract(minutosAleatorios2, 'minutes')
						let fechaFormateadaInicial = fechaInicialMoment.format('YYYY-MM-DD HH:mm:ss.SSS')
						let fechaFormateada1 = fecha1.format('YYYY-MM-DD HH:mm:ss.SSS')
						let fechaFormateada2 = fecha2.format('YYYY-MM-DD HH:mm:ss.SSS')
						return {
							date: date,
							time: time,
							complete: comp,
							start: fechaFormateada1,
							end: fechaFormateada2,
							wipe: fechaFormateadaInicial,
						}
					})
					.catch((err) => console.error(err))
			},
			async espera(a) {
				return new Promise((resolve) => {
					let cardActions = document.querySelector(`#${a}`) // Cambia '.card-actions' por el selector adecuado

					let clickHandler = (event) => {
						console.log(a, event.target.innerText)
						let target = event.target
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
					let result = await this.$rsDB(this.select.db)
						.update('test_SnResults')
						.set(this.myDb)
						.where(`Serial = '${this.device.Serial}'`)
						.execute()
					console.log(result)
				} else {
					this.myDb['test_SnResultsID'] = 'NEWID()'
					let result = await this.$rsDB(this.select.db)
						.insert('test_SnResults')
						.fields(this.myDb)
						.execute()
					console.log(result)
				}
			},
			async upload(file, type) {
				this.$cmd
					.savePS({
						apiUrl: `${this.select.url}/Testing/TestFilesResultsUpload/UploadFile?SerialNumber=${this.device.Serial}&EmployeeID=${this.select.id}&FileType=${type}`,
						filePath: file,
						tenant: this.select.tenant,
						token: this.select.authToken,
					})
					.then((result) => {
						console.log('Result:', result)
					})
					.catch((error) => {
						console.error('Error:', error)
					})
			},
			cerrarVentana() {
				// Cerrar la ventana en Electron
				let { remote } = require('electron')
				let ventanaActual = remote.getCurrentWindow()
				ventanaActual.close()
			},
			async color() {
				/* let info = await this.$db
					.collection('configuration')
					.conditions({
						Model: this.device.SKU.includes('#') ? this.device.SKU.split('#')[0] : this.device.SKU,
					})
					.all_data()
					.get()
				if (info.length) {
					this.myDb.COLOR = info[0].color
				} else */
				await this.$db
					.funcAdmin('modules/pallets/partsurfer', {
						serial: this.device.Serial,
						prod_num: this.device.SKU.includes('#') ? this.device.SKU.split('#')[0] : this.device.SKU,
					})
					.then(async (v) => {
						console.log(v)
						this.myDb.COLOR = v.color
					})
			},
		},
		async beforeCreate() {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			//this.getDev = await this.$cmd.executeScriptCode(getDeviceInfo)
			console.log(this.user, this.getDev)
			this.type = 'desktop'
		},
		async mounted() {
			this.intDev = await this.$cmd.executeScriptCode(intenalDevices)
			let itDH = await this.hddInfo(this.intDev.HDD.Units)
			console.log(itDH)
			this.myDb.Serial_HDD = itDH.group.Serial
			this.myDb.Model_HDD = itDH.group.Description
			this.myDb.HDD_CAPACITY = itDH.group.Size
			this.myDb.RAM = this.intDev.RAM.Total
			let itDG = await this.GPUInfo(this.intDev.video)
			console.log(itDG)
			this.myDb.GPU = itDG.description
			this.myDb.GPU_RAM = itDG.RAM_GPU
			this.myDb.CPU = this.intDev.cpuName

			await this.$cmd.executeScriptCode(getDeviceInfo).then(async (result) => {
				if (result == false) {
					console.error('Error ejecutando script:', error)
				} else {
					this.myDb.Serial = result.Serial
					this.myDb.Model = result.SKU
					if (this.type != 'desktop') {
						var battery = await this.$cmd.executeScriptCode(getBattery)
					}
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
							console.log(this.select)
							break
						}
					}
					if (!this.project.hasOwnProperty('id')) {
						test['Serial'] = `SN ID Check FAIL`
						this.msn['title'] = 'No Found'
						this.msn['message'] = 'The Serial number no found in the system.'
						this.msn.active = true
						return
					}
					if (!res[0].StationID == 15 && !res[0].StationID == '') {
						this.msn['title'] = 'Error'
						this.msn['message'] = 'The unit has not passed through any previous station.'
						this.msn.active = true
						return
					}
					this.device = result
					let datetime = await this.DateTime()
					this.test['Date'] = datetime.date
					this.test['startTime'] = datetime.time
					this.test['Serial'] = `SN ID Check PASS, SNID: ${this.device.Serial}`
					if (this.device.SKU == res[0].ArrivedSKU)
						this.test['Model'] = `Model (SKU ID) Check PASS, SKUID: ${this.device.SKU}`
					this.test['Description'] = `Product Description: ${this.device.Description}`
					if (this.type != 'desktop') {
						this.activate.audio = true
						await this.espera('actionAudio')
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
					}
					if (this.type == 'laptop' || this.type == 'all-in-one') {
						this.activate.camera = true
						await this.espera('actionCamera')
						this.activate.camera = false
					}
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
					this.color()
					this.activate.windows = true
					this.win = await this.$cmd.executeScriptCode(windows)
					this.activate.windows = true
					await this.espera('actionWindows')
					this.activate.windows = false
					if (this.action == 'PASS' && this.win.activationStatus)
						this.test['windows'] = 'Windows Activation Test PASS'
					else this.test['windows'] = 'Windows Activation Test FAIL'
					this.test['OS'] = this.win.os
					this.myDb.OS = this.win.os
					this.test['keyWindows'] = this.win.keyWindows
					this.activate.desktop = true
					await this.espera('actionDesktop')
					this.activate.desktop = false
					let txt = await this.report()
					this.file = await this.$uploadTextFile(this.device.Serial, txt)
					console.log(this.$textFile, this.$imageFile)
					console.log(this.myDb)
					await this.rsSave()
					if (this.$textFile) await this.upload(this.$textFile.path, 1)
					if (this.$imageFile) await this.upload(this.$imageFile.path, 2)
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
