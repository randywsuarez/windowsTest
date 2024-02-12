<template>
	<q-page id="test" class="" style="padding-top: 10px">
		<user-info-grid
			v-show="activate.select"
			:username="user.usuario"
			:project="project.id"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
			:imageSrc="device.img ? device.img : 'logo.png'"
		/>
		<div class="main">
			<q-card class="card" v-show="activate.comparation">
				<q-card-section>
					<q-card-section> <div class="text-h6">Check</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center col row">
					<q-input
						v-model="check.serial"
						@input="handleInputChange"
						type="text"
						label="Serial"
						:prefix="miniSerial"
						placeholder="XX"
						hint="Write the last 2 digits"
					/>
					<q-toggle
						size="50px"
						v-model="check.sku"
						:val="true"
						:label="`Is the SKU ${device.SKU} correct?`"
					/>
				</q-card-section>

				<q-card-actions align="right" id="actionComparation">
					<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
					<q-btn
						flat
						color="positive"
						label="Pass"
						@click="action = 'PASS'"
						v-show="device.Serial == `${miniSerial}${check.serial}` && check.sku"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.type">
				<q-card-section> <div class="text-h6">Select type</div> </q-card-section><q-separator />
				<q-card-section class="row col" id="actionType" style="justify-content: center">
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'laptop'" id="laptop" ref="laptop"
						><img src="022-laptop.png"
					/></q-btn>
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'desktop'" id="desktop" ref="desktop"
						><img src="desktop.png"
					/></q-btn>
					<q-btn
						class="col-md-4 q-ma-sm glow"
						@click="type = 'all-in-one'"
						id="all-in-one"
						ref="all-in-one"
						><img src="all-in-one.png"
					/></q-btn>
				</q-card-section>
			</q-card>
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
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Camera Test</div>
						</div>

						<div class="col-auto">
							<q-btn round color="primary" icon="restart_alt" @click="activateCamera" />
						</div>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<template v-if="activate.camera && camera">
						<CameraCapture
							ref="camaraCapture"
							:key="componentKey"
							@capture-result="handleCaptureResult"
							:imageName="device.Serial"
							v-model="image"
							v-if="activate.camera"
						/>
					</template>
					<div v-if="!camera">No Found</div>
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
				<q-card-section class="center" v-if="battery.hasOwnProperty('DesignCapacity')">
					<p style="text-decoration: red">
						<b>Battery test {{ battery.Status }}</b>
					</p>
					<p><b>Design Capacity</b> = {{ battery.DesignCapacity }}</p>
					<p><b>Full Charge Capacity</b> = {{ battery.FullChargeCapacity }}</p>
					<p><b>Battery Health</b> = {{ battery.BatteryHealth }}%</p>
					<p><b>Cycle Count</b> = {{ battery.CycleCount }}</p>
					<p><b>ID</b> = {{ battery.ID }}</p>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>
				<q-card-actions
					align="right"
					id="actionBattery"
					v-if="battery.hasOwnProperty('DesignCapacity')"
				>
					<q-btn
						flat
						color="negative"
						label="Fail"
						@click="action = 'FAIL'"
						v-if="battery.Status != 'fail'"
					/>
					<q-btn
						flat
						color="positive"
						label="Pass"
						@click="action = 'PASS'"
						v-if="battery.Status != 'fail'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.mousepad">
				<q-card-section>
					<q-card-section> <div class="text-h6">Mouse Pad Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<mouse-pad />
				</q-card-section>
				<q-card-actions align="right" id="actionMousePad">
					<q-btn flat color="negative" label="Fail" @click="test['mousepad'] = 'Mouse pad test FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="test['mousepad'] = 'Mouse pad test PASS'" />
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
			<q-card class="card" v-show="activate.note">
				<q-card-section>
					<q-card-section> <div class="text-h6">Note</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<q-input v-model="form.note" label="Note" />
				</q-card-section>
				<q-card-actions align="right" id="actionNote">
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.gpu">
				<q-card-section>
					<q-card-section> <div class="text-h6">GPU Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" v-if="myGpu.length">
					<q-table
						class="card"
						title="Treats"
						:data="intDev.video"
						dense
						:columns="columns"
						row-key="name"
						binary-state-sort
					>
						<template v-slot:body="props">
							<q-tr :props="props">
								<q-td key="Description" :props="props">{{ props.row.Description }}</q-td>
								<q-td key="AdapterRAM" :props="props">
									{{ props.row.AdapterRAM }}
									<q-popup-edit
										class="card"
										v-model="props.row.AdapterRAM"
										title="Update RAM"
										buttons
										persistent
										v-slot="scope"
									>
										<q-input type="text" v-model="scope.value" dense autofocus hint="Use buttons to close" />
									</q-popup-edit>
								</q-td>
							</q-tr>
						</template>
					</q-table>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>

				<q-card-actions align="right" id="actionGPU" v-show="myGpu.length">
					<q-btn flat color="negative" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.done">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Done</div>
						</div>

						<div class="col-auto">
							<q-btn round color="primary" icon="info" @click="activate.txt = true" />
						</div>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section class="reproductor-content">
					<q-card-section
						class="row col justify-center"
						ref="actionDone"
						id="actionDone"
						style="justify-content: center"
					>
						<div class="col-12 justify-center" v-if="activate.scan">
							<h6>{{ activate.scan }}</h6>
						</div>
						<div class="col-6 justify-center">
							<svg width="75%" id="barcode"></svg>
						</div>
						<div class="col-6 justify-center">
							<svg width="75%" id="barcode2"></svg>
						</div>
						<q-btn flat color="positive" label="Shutdown" @click="sdDevice" />
					</q-card-section>
				</q-card-section>
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

			<q-dialog v-model="msn.active2" persistent transition-show="scale" transition-hide="scale">
				<q-card class="card" style="width: 300px">
					<q-card-section>
						<div class="text-h6">{{ msn.title }}</div>
					</q-card-section>

					<q-card-section class="q-pt-none"> {{ msn.message }} </q-card-section>

					<q-card-actions align="right" class="text-teal">
						<q-btn flat label="OK" v-close-popup />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<q-dialog v-model="activate.txt">
				<q-card>
					<q-card-section>
						<div class="row items-center no-wrap">
							<div class="col">
								<div class="text-h6">Information</div>
							</div>

							<!-- <div class="col-auto">
								<q-btn round color="primary" icon="restart_alt" @click="activate.txt" />
							</div> -->
						</div>
					</q-card-section>

					<q-separator />

					<q-card-section style="max-height: 80vh" class="scroll">
						<div v-html="formatInfo(txt)"></div>
					</q-card-section>

					<q-separator />

					<q-card-actions align="right">
						<q-btn flat label="Close" color="primary" v-close-popup />
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
	import imaging from '../scripts/imaging'
	import MousePad from '../components/MousePad.vue'
	import moment from 'moment'
	import JsBarcode from 'jsbarcode'
	import axios from 'axios'
	export default {
		components: {
			UserInfoGrid,
			Reproductor,
			CameraCapture,
			keyboard,
			MousePad,
		},
		data(r) {
			return {
				user: {},
				device: {
					img: '',
				},
				test: {},
				project: {},
				sound: 'nada',
				componentKey: 0,
				battery: {},
				action: '',
				camera: true,
				check: {
					sku: false,
				},
				activate: {
					type: true,
					select: false,
					audio: false,
					camera: false,
					keyboard: true,
					brightness: false,
					drivers: false,
					windows: false,
					battery: false,
					gpu: false,
					desktop: false,
					done: false,
					comparation: false,
					mousepad: false,
					note: false,
					scan: '',
					txt: false,
				},
				showActions: false,
				win: {},
				intDev: {},
				getDev: {},
				driver: {},
				select: {},
				file: '',
				txt: '',
				omponentKey: 0,
				image: {},
				miniSerial: '',
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
				columns: [
					{
						name: 'Description',
						label: 'Description',
						field: 'Description',
						align: 'left',
						sortable: true,
					},
					{
						name: 'AdapterRAM',
						label: 'RAM',
						field: 'AdapterRAM',
						align: 'left',
						sortable: true,
					},
				],
				myGpu: [],
				info: {},
			}
		},
		methods: {
			formatInfo(info) {
				return info.replace(/\n/g, '<br>')
			},
			async passImaging() {
				const options = {
					method: 'POST',
					headers: {
						tenant: `${this.select.tenant}`,
						Authorization: `Bearer ${this.select.authToken}`,
					},
				}

				return fetch(
					`${this.select.url}/APP/PromoteImageDownloadUnit/SerchSN?sn=${this.device.Serial}&station=Image%20Download`,
					options
				)
					.then((response) => response.json())
					.then((response) => {
						return response._message
					})
					.catch((err) => {
						console.error(err)
						return err._message
					})
			},
			async saveFile(r) {
				r.EmployeeID = this.select.id
				console.log(r)
				/* 	const options = {
					method: 'POST',
					url: `${this.select.url}/Testing/TestFilesResultsUpload/UploadFile`,
					headers: {
						'Content-Type': 'application/json',
						tenant: `${this.select.tenant}`,
						Authorization: `Bearer ${this.select.authToken}`,
					},
					data: r,
				}

				return axios
					.request(options)
					.then(function (response) {
						console.log(response)
						return response.data._isSuccess
					})
					.catch(function (error) {
						console.error(error)
					}) */
				const options = {
					method: 'POST',
					headers: {
						cookie:
							'.AspNetCore.Identity.Application=CfDJ8Pv0WhnmHWxAjuPCJCw7jtyhZLq6S3nyRzfIHKZJOYQtEQ9hL9aX19OzrTjV8uk1xdI9dU-1YPI33AaECMgBFlaESDpOOX2FDk7S2tqsC0gJ1_7V7msodnLjsBAqAgSWnlUVvYl5ijgqNA4qsVC9W8wczbPIbCOuc-SodELJK0o-Mh6ua73Z9I3UleU85L4i0Rwzab_Dolm34AliuJHCwSX3KiisitNWY_sva5QYM8lRePNIy8c41JXlBkwluWhmN6xvOm9Qo3go5bVf2b8Qk3VCe96yOwSmNvyc3RddSBN-45SbH_VCx9ujjiRjqf3t6RmK7viqOz7IW9-pQw7ZBBefbtqSUGFmN8gzXkjD6sg-2fbWJODEvkyJOSQjFKy__-30bXqQ32Tmts8Bb7-yTcJmymXAOhMqRtV8q2X48q3pmZEnUDpTxPkLnsorXbmzMgoWVLC-QapXQBwGO9jr2YoL2Q2DRhPvNPzXo8Ly0wB-0gedagBVhj9CKr6ridtZQwv1jTu_wnf-J5T6XvtLOsUmyAN-7wW6KOVN6fXi8hKk-z3gTeT0SHDhbQPViVMnB3sKZkewxHdX1Mb1QPot5nlytpkdNDfT4vybqpUrFTczco7aDTNU55ORyCjpF6quntw7-LF2rrTYT2UZZlWWlnRZOr5Bhz-Vn_0cNMl_b1_-Zy9_vrvxiYm4BWKKIjf8sVZzY-ayC5vWuRdsxaKS61SD6JFVIbf_sO6Vat2y6R3HTblNM9BHT0T7VLZ0yRwZF5vO_ty6kZxeTUZyhLA8jDAp-p5npa1D3f-gqirOhsa6m8TIjKxn5GH54HA4KaHqkg; ARRAffinity=37af23c8e91607e6e2ecdfc91d68a568c2fae0bff40f0553670e843760cd1961; ARRAffinitySameSite=37af23c8e91607e6e2ecdfc91d68a568c2fae0bff40f0553670e843760cd1961',
						tenant: `${this.select.tenant}`,
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.select.authToken}`,
					},
					//body: `{"SerialNumber":"${this.select.SerialNumber}","EmployeeID":"${this.select.id}","FileType":"${r.FileType}","fileExtension":"${r.fileExtension}",  "fileBase64Str":"${r.fileBase64Str}"`,
					body: JSON.stringify({
						SerialNumber: r.SerialNumber,
						EmployeeID: this.select.id,
						FileType: r.FileType,
						fileExtension: r.fileExtension,
						fileBase64Str: r.fileBase64Str,
					}),
				}

				return fetch(`${this.select.url}/Testing/TestFilesResultsUpload/UploadFile`, options)
					.then((response) => response.json())
					.then((response) => {
						console.log('response: ', response)
						return response.data._isSuccess
					})
					.catch((err) => console.error(err))
			},
			activateCamera() {
				//this.activate.camera = false
				//this.activate.camera = true
				this.componentKey += 1
				//this.$refs.camaraCapture.recargarComponente()
				this.$nextTick(() => {
					this.mostrarComponente = true
				})
				//this.$refs.camaraCapture.captureImage()
			},
			handleInputChange() {
				// Convierte el valor a mayúsculas
				this.check.serial = this.check.serial.toUpperCase()
			},
			async report() {
				let res = Object.values(this.test).includes('fail') ? 'FAIL' : 'PASS'
				let lastdate = await this.DateTime()
				console.log(lastdate)
				this.myDb.DATE = lastdate.wipe
				this.myDb.STATUS = res == 'PASS' ? 'true' : 'false'
				this.myDb.OPERATOR = this.select.id
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
			       ISP Windows Test Ver:3.01 - ${this.project.id}
			       Operator ID: ${this.select.id}
			       Operator Name:${this.user.usuario}
			       Start Date: ${this.test.Date}
			       Start Time: ${this.test.startTime}
			       End Date: ${lastdate.date}
			       End Time: ${lastdate.time}
			       ==============================Devices Information===================================
			       ${this.test.Description}
			       ${this.test.Model}
			       ${this.test.Serial}
			       Windows OS Name: ${this.test.OS} (${this.iTest.Organization ? 'A' : 'M'})
			       Windows Product Key: ${this.test.keyWindows}
			       ${this.test.windows}
			       ${this.test.color ? `Color: ${this.test.color}` : ''}
			       Hard Drive: ${this.intDev.HDD.Total}
			       ${this.intDev.HDD.Units.join('\n')}
			       Memory RAM: ${this.intDev.RAM.Total} - ${this.form.lightRAM ? 'With RBG' : ''}
			       ${this.intDev.RAM.Modules.join('\n')}
			       GPU Verification PASS
			       ${this.intDev.video.map((v) => `${v.Description} ${v.AdapterRAM}`)}
			       CPU
			       ${this.intDev.cpu.join('\n')}
			       ${this.type == 'desktop' ? 'Adapter/Power Supply' : ''}
			       ${this.type == 'desktop' ? `${this.form.adapter}W` : ''}
			       ${this.type == 'desktop' ? 'Cooler System' : ''}
			       ${this.type == 'desktop' ? this.form.coolerSystem : ''}
			       =================================Test Status========================================
			       ${this.type != 'desktop' ? this.test.audio : ''}
			       ${this.type != 'desktop' ? this.test.camera : ''}
			       ${this.test.drivers}
			       ${this.test.display}
			       ${this.type == 'laptop' ? this.test.battery : ''}
			       ${this.type != 'desktop' ? this.test.brightness : ''}
	           ${this.form.note ? `Note: ${this.form.note}` : ''}
			       ====================================Result==========================================
			       Test Result is ${res}
			     `.replace(/^\s*[\r\n]/gm, '')
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

				this.$children[0].$emit('stopCamera')
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
					let cardActions = document.querySelector(`#${a}`)
					//console.log(cardActions)
					let clickHandler = (event) => {
						//console.log(a, event)
						let target = event.target
						if (target.innerText === 'PASS' || target.innerText === 'FAIL') {
							cardActions.removeEventListener('click', clickHandler)
							resolve()
						}
					}

					cardActions.addEventListener('click', clickHandler)
				})
			},
			async espera2(a) {
				return new Promise((resolve) => {
					let cardActions = document.querySelector(`#${a} #laptop`)
					let cardActions2 = document.querySelector(`#${a} #desktop`)
					let cardActions3 = document.querySelector(`#${a} #all-in-one`)
					let clickHandler = (event) => {
						let target = event.target.innerHTML ? event.target.innerHTML : event.target.src
						console.log('target: ', target)
						if (
							target.includes('laptop') ||
							target.includes('desktop') ||
							target.includes('all-in-one')
						) {
							cardActions.removeEventListener('click', clickHandler)
							cardActions2.removeEventListener('click', clickHandler)
							cardActions3.removeEventListener('click', clickHandler)
							resolve()
						}
					}

					cardActions.addEventListener('click', clickHandler)
					cardActions2.addEventListener('click', clickHandler)
					cardActions3.addEventListener('click', clickHandler)
				})
			},
			async rsSave() {
				let sh = await this.$rsDB(this.select.db)
					.select('Serial')
					.from('test_SnResults')
					.where(`Serial = '${this.device.Serial}'`)
					.execute()
				if (sh.length) {
					//console.log(sh)
					let result = await this.$rsDB(this.select.db)
						.update('test_SnResults')
						.set(this.myDb)
						.where(`Serial = '${this.device.Serial}'`)
						.execute()
				} else {
					this.myDb['test_SnResultsID'] = 'NEWID()'
					let result = await this.$rsDB(this.select.db)
						.insert('test_SnResults')
						.fields(this.myDb)
						.execute()
				}
			},
			async upload(file, type) {
				await this.$cmd
					.savePS({
						apiUrl: `${this.select.url}/Testing/TestFilesResultsUpload/UploadFile?SerialNumber=${this.device.Serial}&EmployeeID=${this.select.id}&FileType=${type}`,
						filePath: file,
						tenant: this.select.tenant,
						token: this.select.authToken,
					})
					.then((result) => {
						console.log('Result:', result)
						/* if (this.$textFile && !result) {
								this.msn['title'] = 'Error'
								this.msn['message'] =
									'Oops. The log could not be uploaded to the system. Call the system administrator.'
								this.$q.loading.hide()
								this.msn.active = true
								return
							} */
						return result
					})
					.catch((error) => {
						console.error('Error:', error)
					})
			},
			async uploadImg(file, type) {
				this.$cmd
					.saveImg({
						apiUrl: `${this.select.url}/Testing/TestFilesResultsUpload/UploadFile?SerialNumber=${this.device.Serial}&EmployeeID=${this.select.id}&FileType=${type}`,
						filePath: file,
						tenant: this.select.tenant,
						token: this.select.authToken,
					})
					.then((result) => {
						console.log('Result:', result)
						/* if (this.$imageFile && !result) {
								this.msn['title'] = 'Error'
								this.msn['message'] =
									'Oops. The image could not be uploaded to the system. Call the system administrator.'
								this.$q.loading.hide()
								this.msn.active = true
								return
							} */
						return result
					})
					.catch((error) => {
						console.error('Error:', error)
					})
			},
			cerrarVentana() {
				// Cerrar la ventana en Electron
				this.sdDevice()
				let { remote } = require('electron')
				let ventanaActual = remote.getCurrentWindow()
				ventanaActual.close()
			},
			async infoHP() {
				let info = await this.$db
					.collection('pcbHP')
					.conditions({
						Model: this.device.SKU.includes('#') ? this.device.SKU.split('#')[0] : this.device.SKU,
					})
					.all_data()
					.get()
				if (info.length) {
					if (info[0].hasOwnProperty('COLOR') && info[0].color) {
						this.device.img = info[0].img
						this.myDb.COLOR = info[0].color ? info[0].color : ''
					} else
						await this.$db
							.funcAdmin('modules/pallets/partsurfer', {
								serial: this.device.Serial,
								prod_num: this.device.SKU.includes('#') ? this.device.SKU.split('#')[0] : this.device.SKU,
							})
							.then(async (v) => {
								console.log(v)
								this.myDb.COLOR = v.color ? v.color : ''
								this.form.adapter = v.adapter
							})
				} else
					await this.$db
						.funcAdmin('modules/pallets/partsurfer', {
							serial: this.device.Serial,
							prod_num: this.device.SKU.includes('#') ? this.device.SKU.split('#')[0] : this.device.SKU,
						})
						.then(async (v) => {
							console.log(v)
							this.myDb.COLOR = v.color ? v.color : ''
							this.form.adapter = v.adapter
						})
				this.test['color'] = this.myDb.COLOR
			},
			getGraphicsInfo(dxdiagContent) {
				// Buscar el patrón para el nombre de la tarjeta gráfica
				const cardNamePattern = /Card name: (.+)/g
				const dedicatedMemoryPattern = /Dedicated Memory: (.+)/g

				let match
				const graphicsInfoArray = []

				// Buscar todas las coincidencias para el nombre de la tarjeta gráfica
				while ((match = cardNamePattern.exec(dxdiagContent)) !== null) {
					const cardName = match[1].trim()

					// Buscar la coincidencia correspondiente para la memoria dedicada
					const dedicatedMemoryMatch = dedicatedMemoryPattern.exec(dxdiagContent)
					const dedicatedMemoryString = dedicatedMemoryMatch
						? dedicatedMemoryMatch[1].trim()
						: 'No se encontró'

					// Convertir la memoria dedicada a gigabytes y agregar "GB" como sufijo
					const dedicatedMemoryInGB =
						dedicatedMemoryString !== 'No se encontró'
							? `${Math.round(parseFloat(dedicatedMemoryString.replace(' MB', '')) / 1024)} GB`
							: 'No se encontró'

					// Agregar la información al array
					graphicsInfoArray.push({
						Description: cardName,
						AdapterRAM: dedicatedMemoryInGB,
					})
				}

				return graphicsInfoArray
			},
			async saveMng() {
				let search = await this.$db
					.collection('devices')
					.conditions({
						Serial: this.device.Serial,
					})
					.limit(1)
					.all_data()
					.get()
				if (search.length) {
					await this.$db.doc(`devices/${search[0]._id}`).update(this.info)
				} else {
					await this.$db.doc('devices').add(this.info)
				}
				let intDB = this.myDb
				intDB['project'] = this.project.id
				intDB['OPERATOR'] = this.user.usuario
				intDB['TYPE'] = this.type.toUpperCase()
				intDB['PROCESSED'] = this.iTest.Organization ? 'A' : 'M'
				let test = await this.$db
					.collection('test_SnResults')
					.conditions({
						Serial: this.device.Serial,
					})
					.limit(1)
					.all_data()
					.get()
				console.log('test: ', test.length)
				if (test.length) {
					console.log(test[0]._id)
					let r = await this.$db.doc(`test_SnResults/${test[0]._id}`).update(intDB)
					console.log(r)
				} else {
					let r = await this.$db.doc('test_SnResults').add(intDB)
					console.log(r)
				}
			},
			async sdDevice() {
				await this.$cmd.executeScriptCode(['Stop-Computer -ComputerName localhost'])
			},
			async checkDevice() {
				let res = await this.$rsDB(this.project.db)
					.select('Serial')
					.from('test_SnResults')
					.where(`Serial = '${this.device.Serial}'`)
					.limit(1)
					.execute()
				if (res.length)
					this.$q.notify({
						type: 'negative',
						message: `This unit was tested previously.`,
					})
			},
			async myTest() {
				this.$q.loading.show()
				this.intDev = await this.$cmd.executeScriptCode(intenalDevices)
				let itDH = await this.hddInfo(this.intDev.HDD.Units)
				console.log(itDH)
				this.myDb.Serial_HDD = itDH.group.Serial
				this.myDb.Model_HDD = itDH.group.Description
				this.myDb.HDD_CAPACITY = itDH.group.Size
				this.myDb.RAM = this.intDev.RAM.Total
				await this.$cmd.executeScriptCode(getDeviceInfo).then(async (result) => {
					if (result == false) {
						console.error('Error ejecutando script:', error)
					} else {
						this.device = result
						this.info = { ...this.info, ...this.device }
						this.miniSerial = this.device.Serial.slice(0, -2)
						await this.infoHP()
						this.myDb.Serial = result.Serial
						this.myDb.Model = result.SKU
						let res = ''
						for (let x of this.$env.project) {
							let u = await this.$rsNeDB('credenciales').findOne({ tenant: x.id })
							res = await this.$rsDB(x.db)
								.select('SerialNumber, ArrivedSKU, StationID, SKU')
								.from('sfis_WorkTracking')
								.where(`SerialNumber = '${result.Serial}'`)
								.execute()
							console.log(x.id, res)
							if (res.length) {
								/* let sttn = await this.$rsDB(x.admin)
									.select('Name')
									.from('conf_Station')
									.where(`Station = '${res.StationID}'`)
									.execute()
								this.project['Station'] = sttn[0].Name */
								this.project['id'] = x.id
								this.project['db'] = x.db
								this.project['operator'] = u.id
								this.select = { ...x, ...u }
								console.log('select: ', this.select)
								break
							}
						}
						if (!this.project.hasOwnProperty('id')) {
							this.$q.loading.hide()
							this.test['Serial'] = `SN ID Check FAIL`
							this.msn['title'] = 'No Found'
							this.msn['message'] = 'The Serial number no found in the system.'
							this.msn.active = true
							return
						}
						console.log(res[0].ArrivedSKU, this.device.SKU)
						if (res[0].ArrivedSKU != this.device.SKU && this.type == 'laptop') {
							this.$q.loading.hide()
							this.test['SKU'] = `SKU ID Check FAIL`
							this.msn['title'] = 'No Math'
							this.msn[
								'message'
							] = `SKUs are not the same, Device: ${this.device.SKU} <> System: ${res[0].ArrivedSKU}`
							this.msn.active = true
							return
						}
						/* if (this.device.SKU.includes(res[0].SKU) && this.type != 'laptop') {
							this.$q.loading.hide()
							this.test['SKU'] = `SKU ID Check FAIL`
							this.msn['title'] = 'No Math'
							this.msn[
								'message'
							] = `SKUs are not the same, Device: ${this.device.SKU} <> System: ${res[0].SKU}`
							this.msn.active2 = true
						} */
						if (!res[0].StationID == 15 || !res[0].StationID) {
							this.$q.loading.hide()
							this.msn['title'] = 'Error'
							this.msn['message'] = 'The unit has not passed through any previous station.'
							this.msn.active = true
							return
						}
						await this.checkDevice()
						let datetime = await this.DateTime()
						this.test['Date'] = datetime.date
						this.test['startTime'] = datetime.time
						this.test['Serial'] = `SN ID Check PASS, SNID: ${this.device.Serial}`
						if (this.device.SKU == res[0].ArrivedSKU)
							this.test['Model'] = `Model (SKU ID) Check PASS, SKUID: ${this.device.SKU}`
						this.test['Description'] = `Product Description: ${this.device.Description}`
						this.$q.loading.hide()
						this.activate.type = true
						await this.espera2('actionType')
						this.activate.type = false
						this.activate.comparation = true
						await this.espera('actionComparation')
						this.activate.comparation = false
						this.activate.select = true
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
						if (this.type == 'laptop') {
							this.activate.battery = true
							var battery = await this.$cmd.executeScriptCode(getBattery)
							this.info = { ...this.info, battery }
							if (battery.Status.includes('fail')) {
								this.test[
									'battery'
								] = `Battery test FAIL, Design Capacity = ${battery.DesignCapacity}, Full Charge Capacity= ${battery.FullChargeCapacity}, Battery Health= ${battery.BatteryHealth}%, Cycle Count= ${battery.CycleCount} ID= ${battery.ID}`
								this.battery = battery
								console.log('Bateria: ', this.battery)
								this.activate.battery = true
								await this.espera('actionBattery')
							} else
								this.test[
									'battery'
								] = `Battery test PASS, Design Capacity = ${battery.DesignCapacity}, Full Charge Capacity= ${battery.FullChargeCapacity}, Battery Health= ${battery.BatteryHealth}%, Cycle Count= ${battery.CycleCount} ID= ${battery.ID}`
							this.activate.battery = false
							this.activate.mousepad = true
							await this.espera('actionMousePad')
							this.activate.mousepad = false
						}
						if (this.type != 'desktop') {
							this.activate.audio = true
							await this.espera('actionAudio')
							this.activate.brightness = true
							this.$cmd.executeScriptCode(GetMntBringhtness)
							setTimeout(() => {
								this.showActions = true
							}, 4000)
							await this.espera('actionBrightness')
							this.activate.brightness = false
						}
						if (this.type == 'laptop' || this.type == 'all-in-one') {
							if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
								await navigator.mediaDevices
									.enumerateDevices()
									.then(async (devices) => {
										const cameras = devices.filter((device) => device.kind === 'videoinput')
										if (cameras.length > 0) {
											console.log('Tu computadora tiene una cámara.')
											this.camera = true
										} else {
											console.log('No se encontraron cámaras en tu computadora.')
											this.camera = false
										}
									})
									.catch((error) => {
										console.error('Error al enumerar dispositivos:', error)
										this.camera = true
									})
							} else {
								console.log('La API de MediaDevices no es compatible con tu navegador.')
							}
						}
						if (this.type == 'laptop' || this.type == 'all-in-one') {
							this.activate.camera = true
							await this.espera('actionCamera')
							this.activate.camera = false
						}
						console.log(this.image)
						this.activate.windows = true
						this.win = await this.$cmd.executeScriptCode(windows)
						this.info = { ...this.info, ...this.win }
						this.activate.windows = true
						await this.espera('actionWindows')
						this.activate.windows = false
						if (this.action == 'PASS' && this.win.activationStatus)
							this.test['windows'] = 'Windows Activation Test PASS'
						else this.test['windows'] = 'Windows Activation Test FAIL'
						this.test['OS'] = this.win.os
						this.myDb.OS = this.win.os
						this.test['keyWindows'] = this.win.keyWindows
						//this.myGpu.then((v) => (this.myGpu = v))
						//this.myGpu = await this.getGraphicsInfo(this.myGpu.result.value)
						this.activate.gpu = true
						if (this.intDev.video.some((obj) => obj.AdapterRAM.includes('4'))) {
							this.myGpu = await this.$cmd.getDx({
								Serial: this.device.Serial,
							})
							this.intDev.video = this.intDev.video.map((objA) => {
								const matchB = this.myGpu.find((objB) => objB.Description === objA.Description)
								return matchB ? { ...objA, AdapterRAM: matchB.AdapterRAM } : objA
							})
							console.log('myGpu: ', this.myGpu)
						} else this.myGpu = this.intDev.video
						let itDG = await this.GPUInfo(this.myGpu)
						await this.espera('actionGPU')
						this.activate.gpu = false
						this.myDb.GPU = itDG.description
						this.myDb.GPU_RAM = itDG.RAM_GPU
						this.myDb.CPU = this.intDev.cpuName.join('\n')
						if (this.type == 'desktop') {
							this.activate.desktop = true
							await this.espera('actionDesktop')
							this.info = {
								...this.info,
								...this.form,
							}
							this.activate.desktop = false
						}
						if (this.type == 'desktop' || this.type == 'all-in-one') {
							this.activate.note = true
							await this.espera('actionNote')
							this.info = {
								...this.info,
								...this.form,
							}
							this.activate.note = false
						}
						this.info = {
							...this.info,
							video: itDG,
							cpuName: this.intDev.cpuName,
							cpu: this.intDev.cpu,
							RAM: this.intDev.RAM,
							HDD: this.intDev.HDD,
						}
						this.$q.loading.show()
						this.txt = await this.report()
						this.file = await this.$uploadTextFile(this.device.Serial, this.txt)
						console.log(this.file, this.$image)
						if (this.file) await this.saveFile(this.file)
						if (this.image) await this.saveFile(this.image)
						//if (this.$textFile) await this.upload(this.$textFile.path, 1)
						//if (this.$imageFile) await this.uploadImg(this.$imageFile.path, 2)
						this.info = {
							...this.info,
							report: this.txt,
						}
						await this.rsSave()
						await this.saveMng()
						this.activate.scan = await this.passImaging()
						this.$q.loading.hide()
						this.activate.done = true
						JsBarcode('#barcode', this.device.Serial, {
							format: 'CODE128',
							lineColor: '#000',
							width: 1,
							height: 50,
							displayValue: true,
							//text: this.form.serial,
							textAlign: 'center',
							fontSize: 12,
						})
						JsBarcode('#barcode2', this.device.SKU, {
							format: 'CODE128',
							lineColor: '#000',
							width: 1,
							height: 50,
							displayValue: true,
							//text: this.form.sku,
							textAlign: 'center',
							fontSize: 12,
						})
					}
				})
			},
		},
		async beforeCreate() {
			this.user = await this.$rsNeDB('credenciales').findOne({})

			/* console.log(this.user, this.getDev)
					this.type = 'desktop' */
		},
		async mounted() {
			this.$q.loading.show()
			this.iTest = await this.$cmd.executeScriptCode(imaging)
			this.$q.loading.hide()
			if (!this.iTest.Organization)
				this.$q
					.dialog({
						dark: true,
						title: 'Status',
						message: 'This unit did not go through the imaging process, do you want to continue?',
						persistent: true,
					})
					.onOk(() => {
						this.iTest.Date = moment(this.iTest.Date, 'MM/DD/YYYY, h:mm:ss A').format(
							'YYYY-MM-DD HH:mm:ss.SSS'
						)
						this.info = this.iTest
						this.myTest()
					})
					.onCancel(() => {
						this.cerrarVentana()
						// console.log('Cancel')
					})
					.onDismiss(() => {
						// console.log('I am triggered on both OK and Cancel')
					})
			else {
				this.iTest.Date = moment(this.iTest.Date, 'MM/DD/YYYY, h:mm:ss A').format(
					'YYYY-MM-DD HH:mm:ss.SSS'
				)
				this.info = this.iTest
				this.myTest()
			}
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
	.glow:hover {
		animation-name: glowEffect;
		animation-duration: 0.5s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes glowEffect {
		0% {
			box-shadow: 0 0 10px rgba(0, 102, 255, 0.8);
		}
		50% {
			box-shadow: 0 0 20px rgba(0, 102, 255, 0.6);
		}
		100% {
			box-shadow: 0 0 10px rgba(0, 102, 255, 0.8);
		}
	}
</style>
