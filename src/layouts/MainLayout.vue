<template>
	<q-layout view="lHh Lpr lFf" class="main-layout">
		<q-header class="main-header">
			<q-toolbar>
				<q-btn flat dense round icon="logout" @click="cerrarSesion" />

				<q-toolbar-title>Windows Test - ISPT Services</q-toolbar-title>

				<!-- Botón de cierre con animación -->
				<div class="close-button" @click="cerrarVentana">
					<q-icon name="close" size="24px" color="white" />
				</div>
			</q-toolbar>
		</q-header>

		<!-- <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
			<q-list>
				<q-item-label header class="text-grey-8"> Essential Links </q-item-label>
				<EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
			</q-list>
		</q-drawer> -->

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
			}
		},
		async created() {
			this.test = await this.$cmd.executeScriptCode(winDate)
			console.log(this.test)
			if (!this.test.result)
				this.$q
					.dialog({
						dark: true,
						title: 'Error',
						message: `${this.test.data}`,
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
							throw new Error('Invalid response')
						}
					} catch (err) {
						console.error(err)
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
				let dbNombre = 'NeDB'
				let vm = this

				// Intenta eliminar la base de datos
				let solicitudEliminacion = window.indexedDB.deleteDatabase(dbNombre)

				// Manejar el éxito
				solicitudEliminacion.onsuccess = function () {
					console.log('Base de datos eliminada con éxito')
					vm.$router.push('/login')
				}

				// Manejar el error
				solicitudEliminacion.onerror = function (event) {
					console.error('Error al intentar eliminar la base de datos: ', event.target.errorCode)
				}

				// Manejar el evento de bloqueo, si existe
				solicitudEliminacion.onblocked = function () {
					console.log(
						'La eliminación de la base de datos está bloqueada, cierra otras pestañas o aplicaciones que puedan estar utilizando la base de datos.'
					)
				}
			},
		},
	}
</script>
