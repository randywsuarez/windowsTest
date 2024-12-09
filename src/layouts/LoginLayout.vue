<template>
	<q-layout view="lHh Lpr lFf">
		<div class="login-background">
			<!-- Fondo de pantalla -->
		</div>
		<div class="login-container">
			<q-card class="login-card">
				<q-card-section>
					<div class="login-content">
						<!-- Puedes agregar tu logo si lo deseas -->
						<q-img src="CTL.png" />

						<!-- Campos del formulario -->
						<div class="row col">
							<q-input v-model="user" label="User" class="col-12" />
							<q-input
								v-model="password"
								label="Password"
								:type="isPwd ? 'password' : 'text'"
								@keyup.enter="iniciarSesion"
								class="col-12"
							>
								<template v-slot:append>
									<q-icon
										:name="isPwd ? 'visibility_off' : 'visibility'"
										class="cursor-pointer"
										@click="isPwd = !isPwd"
									/>
								</template>
							</q-input>
							<!-- <q-checkbox v-model="recordarCredenciales" label="RememberMe" /> -->
						</div>

						<!-- Botón de inicio de sesión -->
						<q-btn
							@click="iniciarSesion"
							label="Sign On"
							style="margin-top: 20px"
							:disable="!password || !user"
						/>
					</div>
				</q-card-section>
			</q-card>
		</div>
		<div :class="['close-button', colorClass]" @click="cerrarVentana">
			<q-icon name="close" size="24px" color="white" />
		</div>
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
	</q-layout>
</template>

<script>
	export default {
		data() {
			return {
				//logoSrc: "@/assets/logo.png",
				user: '',
				password: '',
				recordarCredenciales: true,
				colorIndex: 0,
				hasInternet: navigator.onLine,
				isDialogVisible: false,
				checkInterval: null,
				isPwd: true,
			}
		},
		computed: {
			colorClass() {
				const colors = ['black', 'blue', 'red']
				return colors[this.colorIndex % colors.length]
			},
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
			async iniciarSesion() {
				if (this.user || this.password) {
					this.$q.loading.show()
					let auth = await this.$db.funcAdmin('modules/ispt/authenticate', {
						userName: this.user,
						password: this.password,
					})
					if (auth) {
						// Inicio de sesión exitoso
						if (this.recordarCredenciales) {
							this.$q.loading.hide()
							await this.$rsNeDB('credenciales').clearCollection()
							await this.$rsNeDB('user').clearCollection()
							let aa = await this.$rsNeDB('credenciales').insert({
								user: this.user,
								authToken: auth.authToken,
								id: auth.id,
							})
							await this.$rsNeDB('user').insert({
								userName: this.user,
								password: this.password,
								RememberMe: 0,
							})
							/* const documentos = await this.$rsNeDB('user').findOne({
								userName: this.user,
							}) */
						}

						// Redirigir a la siguiente página (por ejemplo, el panel principal)
						this.$router.push('/')
					} else {
						this.$q.loading.hide()
						this.$q
							.dialog({
								dark: true,
								title: 'Error',
								message: `Incorrect username and/or password`,
								persistent: false,
							})
							.onOk(() => {})
							.onCancel(() => {
								// console.log('Cancel')
							})
							.onDismiss(() => {
								// console.log('I am triggered on both OK and Cancel')
							})
						// Inicio de sesión fallido
						console.error('Inicio de sesión fallido. Verifica user y contraseña.')
					}
				}
			},
			cerrarVentana() {
				// Cerrar la ventana en Electron
				const { remote } = require('electron')
				const ventanaActual = remote.getCurrentWindow()
				ventanaActual.close()
			},
			toggleColor() {
				this.colorIndex++
			},
		},
		created() {
			this.startInternetCheckInterval()
		},
		beforeDestroy() {
			// Detiene el intervalo antes de destruir el componente para evitar fugas de memoria
			this.stopInternetCheckInterval()
		},
		mounted() {
			this.$q.loading.hide()
			// Iniciar la animación cada 2 segundos
			this.intervalId = setInterval(() => {
				this.colorIndex++
			}, 2000)
		},
		beforeDestroy() {
			// Limpiar el intervalo al destruir el componente
			clearInterval(this.intervalId)
		},
	}
</script>

<style scoped>
	.login-background {
		background: linear-gradient(to bottom right, #aedff7, #ffffff); /* Degradado blanco-azul */
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;
	}

	.login-container {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.login-card {
		background: rgba(255, 255, 255, 0.1); /* Color blanco transparente para el glassmorphism */
		width: 300px; /* Ajusta el ancho según sea necesario */
		padding: 20px;
		border-radius: 10px;
		backdrop-filter: blur(10px); /* Aplicar efecto de desenfoque al fondo */
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.login-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		z-index: 999; /* Asegúrate de que el botón esté en la parte superior */
		transition: background-color 0.5s ease-in-out;
	}

	/* Colores */
	.black {
		background-color: black;
	}
	.blue {
		background-color: blue;
	}
	.red {
		background-color: red;
	}
</style>
