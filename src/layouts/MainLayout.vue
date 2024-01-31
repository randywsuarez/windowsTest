<template>
	<q-layout view="lHh Lpr lFf" class="main-layout">
		<q-header class="main-header">
			<q-toolbar>
				<q-btn flat dense round icon="logout" @click="cerrarSesion" />

				<q-toolbar-title>Windows Test - ISPT Services V{{ version }}</q-toolbar-title>

				<!-- Botón de cierre con animación -->
				<div class="close-button" @click="cerrarVentana">
					<q-icon name="close" size="24px" color="white" />
				</div>
			</q-toolbar>
		</q-header>

		<q-dialog v-model="isDialogVisible" class="login-card" persistent>
			<q-card>
				<q-card-section>
					<div class="text-h6">Without Internet</div>
				</q-card-section>

				<q-card-section>
					<div class="q-pa-md text-h6">
						There is no Internet conection. Please verify your connection.
					</div>
				</q-card-section>

				<!-- Puedes personalizar los botones según tus necesidades -->
				<q-card-actions align="right">
					<!-- <q-btn label="Cerrar" color="primary" @click="closeDialog" /> -->
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="updt" persistent>
			<q-card>
				<q-card-section>
					<div class="text-h6">Update</div>
				</q-card-section>

				<q-separator />

				<q-card-section style="max-height: 50vh">
					<p>
						New version available! its current version is: {{ v.current }} and the new version is:
						{{ v.new }}
					</p>
				</q-card-section>
				<q-separator />

				<q-card-section style="max-height: 50vh" class="scroll">
					<h4>Changes</h4>
					<p>
						{{ v.body }}
					</p>
				</q-card-section>

				<q-separator />

				<q-card-actions align="right">
					<q-btn flat label="Accept" color="primary" @click="update" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<style scoped>
	.main-layout {
		background: linear-gradient(45deg, #ffffff, #87cefa); /* Degradado entre blanco y azul pastel */
		transition: background 0.5s ease-in-out; /* Animación de cambio de fondo */
	}

	.main-header {
		background: rgba(255, 255, 255, 0.1); /* Fondo translúcido para el efecto de vidrio */
		backdrop-filter: blur(10px);
		transition: background 0.5s ease-in-out; /* Animación de cambio de fondo */
		border-bottom: 1px solid rgba(255, 255, 255, 0.2); /* Borde en la parte inferior */
	}

	.close-button {
		cursor: pointer;
		margin-left: auto;
		padding: 10px;
		transition: transform 0.3s ease-in-out; /* Animación de escala */
	}

	.close-button:hover {
		transform: scale(1.2); /* Efecto de escala al pasar el mouse */
	}
</style>

<script>
	import EssentialLink from 'components/EssentialLink.vue'
	import winDate from '../scripts/updateDate'
	import UpdateService from '../utils/updateService'
	import env from '../utils/env'

	const linksData = [
		{
			title: 'Login',
			caption: 'Login',
			icon: 'school',
			link: '/login',
		},
	]

	export default {
		name: 'MainLayout',
		components: {
			EssentialLink,
		},
		data() {
			return {
				leftDrawerOpen: false,
				essentialLinks: linksData,
				test: { result: false },
				hasInternet: navigator.onLine,
				isDialogVisible: false,
				checkInterval: null,
				intervalId: null,
				updt: false,
				v: {},
				version: '',
				updateService: '',
			}
		},
		async created() {
			this.version = env.version
			this.startInternetCheckInterval()
			this.test = await this.$cmd.executeScriptCode(winDate)
			console.log(this.test)
			if (!this.test.result)
				this.$q
					.dialog({
						dark: true,
						title: 'Error',
						message: `You must run the program as administrator`,
						persistent: true,
					})
					.onOk(() => {
						this.cerrarVentana()
					})
					.onCancel(() => {
						this.cerrarVentana()
						// console.log('Cancel')
					})
					.onDismiss(() => {
						// console.log('I am triggered on both OK and Cancel')
					})
			let credencialesGuardadas = await this.$rsNeDB('credenciales').findOne({})
			console.log('randy: ', credencialesGuardadas)
			//console.log(credencialesGuardadas)
			if (credencialesGuardadas == null) {
				console.log('sin registro')
				this.$q.loading.hide()
				this.$router.push('/login')
			} else {
				this.comprobarToken(credencialesGuardadas)
			}
		},

		methods: {
			checkInternetConnection() {
				this.hasInternet = navigator.onLine

				if (!this.hasInternet && !this.isDialogVisible) {
					// Si no hay conexión y el diálogo no está visible, muestra el diálogo
					this.isDialogVisible = true
				} else if (this.hasInternet && this.isDialogVisible) {
					// Si hay conexión y el diálogo está visible, cierra el diálogo
					this.isDialogVisible = false
				}
			},
			closeDialog() {
				// Método para cerrar el diálogo manualmente
				this.isDialogVisible = false
			},
			startInternetCheckInterval() {
				// Inicia el intervalo para verificar la conexión cada 5 segundos (puedes ajustar el valor)
				this.checkInterval = setInterval(this.checkInternetConnection, 5000)
			},
			stopInternetCheckInterval() {
				// Detiene el intervalo cuando ya no es necesario
				clearInterval(this.checkInterval)
			},
			async comprobarToken() {
				let respuesta = await this.checkToken()
				//console.log(respuesta[0])
				if (respuesta.length && respuesta[0].estado === 'OK') {
					console.log('Usuario autenticado')
				} else {
					console.error('Token no válido, redirigiendo al LoginLayout')
					this.$q.loading.hide()
					this.$router.push('/login')
				}
			},
			async checkToken() {
				const checkTokenPromises = this.$env.project.map(async (s) => {
					try {
						let info = await this.$rsNeDB('credenciales').findOne({
							tenant: s.id,
						})
						const options = {
							method: 'GET',
							headers: {
								Authorization: info.AuthToken,
							},
						}

						const response = await fetch(`${s.url}/Projects/ObtainProjects`, options)
						const data = await response.json()

						if (data.length) {
							//console.log(data)
							return { estado: 'OK' }
						} else {
							//throw new Error('Invalid response')
						}
					} catch (err) {
						//console.error(err)
						throw err
					}
				})
				return Promise.all(checkTokenPromises)
			},
			cerrarVentana() {
				// Cerrar la ventana en Electron
				const { remote } = require('electron')
				const ventanaActual = remote.getCurrentWindow()
				ventanaActual.close()
			},
			cerrarSesion() {
				this.$cmd.logout()
				this.$router.push('/login')
			},
			async update() {
				this.$q.loading.show({
					message: 'Downloading and updating...',
				})
				const exito = await this.updateService.descargarYDescomprimir(actualizacionDisponible.version)

				if (exito) {
					// Actualización exitosa, puedes realizar acciones adicionales si es necesario
					this.$q.loading.hide()
					await this.$cmd.update()
					//await updateService.program()

					//window.location.reload(true) // Recargar la aplicación después de la actualización
				} else {
					this.$q.loading.hide()
					this.$q.notify({
						color: 'negative',
						message: 'Error downloading or unzipping the update.',
					})
				}
			},
		},
		mounted() {
			this.updateService = new UpdateService(env.github.user, env.github.repository, env.version)

			this.intervalId = setInterval(async () => {
				const actualizacionDisponible = await this.updateService.verificarActualizacion()

				if (actualizacionDisponible.result) {
					clearInterval(this.intervalId)
					this.v['current'] = env.version
					this.v['new'] = actualizacionDisponible.version
					this.v['body'] = actualizacionDisponible.body
					this.updt = actualizacionDisponible.result
					/* this.$q
						.dialog({
							title: 'Update',
							color: 'positive',
							message: `New version available! its current version is: ${env.version} and the new version is: ${actualizacionDisponible.version}`,
							persistent: true,
							OK: 'Update',
						})
						.onOk(async () => {})
						.onCancel(() => {})
						.onDismiss(() => {}) */
				}
			}, 10000)
		},
		beforeDestroy() {
			// Detiene el intervalo antes de destruir el componente para evitar fugas de memoria
			this.stopInternetCheckInterval()
		},
	}
</script>
