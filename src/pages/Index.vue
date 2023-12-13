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
				<q-card-title>Cámara</q-card-title>
			</q-card-section>
			<q-card-section>
				<CameraCapture @capture-result="handleCaptureResult" :imageName="device.Serial" />
			</q-card-section>
			<q-card-actions align="right">
				<q-btn color="negative" label="Fail" @click="handleAction('fail')" />
				<q-btn color="positive" label="Pass" @click="handleAction('pass')" />
			</q-card-actions>
		</q-card>
	</q-page>
</template>

<script>
	import UserInfoGrid from '../components/UserInfoGrid.vue'
	import Reproductor from '../components/soundTest.vue'
	import CameraCapture from '../components/camaraCapture.vue'
	export default {
		components: {
			UserInfoGrid,
			Reproductor,
			CameraCapture,
		},
		data() {
			return {
				user: {},
				device: {},
				test: {},
				project: {},
				sound: 'nada',
				activate: {
					audio: false,
					camera: false,
				},
			}
		},
		methods: {
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
				// Realizar acciones adicionales según el botón presionado (Fail o Pass)
				// Puedes agregar lógica específica aquí
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
			audioTest(a) {
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
			await this.$cmd.executeScript('GetDeviceInfo', async (error, result) => {
				if (error) {
					console.error('Error ejecutando script:', error)
				} else {
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
					await this.audioTest()
					this.activate.camera = true
					console.log(this.test)
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
