<template>
	<q-layout view="lHh Lpr lFf" class="main-layout">
		<q-header class="main-header" v-show="myHeader">
			<q-toolbar @mousedown="startDrag">
				<q-btn flat dense round icon="home" to="/" style="color: green" />

				<q-toolbar-title style="color: black; font-size: 14px"
					>Windows Test - Close the Loop V{{ version }}</q-toolbar-title
				>

				<!-- Menu button with dropdown -->
				<q-btn flat dense round icon="more_vert" color="grey">
					<q-menu>
						<q-list style="min-width: 200px">
							<q-item clickable v-close-popup @click="checkForUpdates">
								<q-item-section avatar>
									<q-icon name="system_update" />
								</q-item-section>
								<q-item-section>Check for Updates</q-item-section>
							</q-item>

							<q-item clickable v-close-popup @click="showUpdateSettings">
								<q-item-section avatar>
									<q-icon name="settings" />
								</q-item-section>
								<q-item-section>Update Settings</q-item-section>
							</q-item>

							<q-separator />

							<q-item clickable v-close-popup @click="myFunction">
								<q-item-section avatar>
									<q-icon name="dns" />
								</q-item-section>
								<q-item-section>Select Server</q-item-section>
							</q-item>

							<q-separator />

							<q-item clickable v-close-popup @click="cerrarSesion">
								<q-item-section avatar>
									<q-icon name="logout" color="red" />
								</q-item-section>
								<q-item-section>Logout</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>

				<!-- Close button -->
				<div class="close-button" @click="cerrarVentana">
					<q-icon name="close" size="24px" color="black" />
				</div>
			</q-toolbar>
		</q-header>

		<!-- Internet Connection Dialog -->
		<q-dialog v-model="isDialogVisible" class="login-card" persistent>
			<q-card>
				<q-card-section>
					<div class="text-h6">Without Internet</div>
				</q-card-section>

				<q-card-section>
					<div class="q-pa-md text-h6">
						There is no Internet connection. Please verify your connection.
					</div>
				</q-card-section>

				<q-card-actions align="right">
					<!-- <q-btn label="Close" color="primary" @click="closeDialog" /> -->
				</q-card-actions>
			</q-card>
		</q-dialog>

		<!-- Update Dialog Component -->
		<update-dialog 
			ref="updateDialog"
			:update-service="updateService" />

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<style scoped>
	.main-layout {
		background: linear-gradient(45deg, #ffffff, #87cefa); /* Gradient from white to pastel blue */
		transition: background 0.5s ease-in-out; /* Background transition animation */
	}

	.main-header {
		background: rgba(255, 255, 255, 0.1); /* Translucent background for glass effect */
		backdrop-filter: blur(10px);
		transition: background 0.5s ease-in-out; /* Background transition animation */
		border-bottom: 1px solid rgba(255, 255, 255, 0.2); /* Bottom border */
	}

	.close-button {
		cursor: pointer;
		margin-left: auto;
		padding: 10px;
		transition: transform 0.3s ease-in-out; /* Scale animation */
	}

	.close-button:hover {
		transform: scale(1.2); /* Scale effect on hover */
	}
</style>

<script>
	import { mapState, mapMutations } from 'vuex'
	import EssentialLink from 'components/EssentialLink.vue'
	import UpdateService from '../utils/updateService'
	import UpdateDialog from 'components/UpdateDialog.vue'
	import env from '../utils/env'
	const electron = require('electron')

	const linksData = [
		{
			title: 'Login',
			caption: 'Login',
			icon: 'school',
			link: '/login',
		},
	]

	export default {
		props: {
			myHeader: {
				type: Boolean,
				default: true,
			},
		},
		name: 'MainLayout',
		components: {
			EssentialLink,
			UpdateDialog
		},
		data() {
			return {
				leftDrawerOpen: false,
				essentialLinks: linksData,
				test: { result: false },
				hasInternet: navigator.onLine,
				isDialogVisible: false,
				checkInterval: null,
				version: '',
				updateService: null,
			}
		},
		async created() {
			this.version = env.version
			this.startInternetCheckInterval()
			
			// Initialize update service with env config
			this.updateService = new UpdateService(env);
			
			let credencialesGuardadas = await this.$rsNeDB('credenciales').findOne({})
			if (credencialesGuardadas == null) {
				this.$q.loading.hide()
				this.$router.push('/login')
			} else {
				this.comprobarToken(credencialesGuardadas)
			}
		},

		computed: {
			...mapState('information', ['token', 'user', 'userID']),
		},

		methods: {
			...mapMutations('information', ['SET_TOKEN', 'SET_USER', 'SET_USERID']),
			
			// Check for updates
			async checkForUpdates() {
				if (this.$refs.updateDialog) {
					await this.$refs.updateDialog.checkForUpdates(true);
				}
			},
			
			// Show update settings
			showUpdateSettings() {
				if (this.$refs.updateDialog) {
					this.$refs.updateDialog.showSettings();
				}
			},
			
			myFunction() {
				// Server selection function
				this.$q
					.dialog({
						title: 'Select Server',
						message: 'Choose your options:',
						options: {
							type: 'radio',
							model: this.$q.localStorage.getItem('api'),
							// inline: true,
							items: [
								{ label: 'Server', value: 'server', color: 'primary' },
								{ label: 'Public', value: 'public', color: 'secondary' },
								{ label: 'Dev', value: 'dev', color: 'red' },
								{ label: 'Local', value: 'local', color: 'orange' },
							],
						},
						cancel: true,
						persistent: true,
					})
					.onOk((data) => {
						this.$q.localStorage.set('api', data)
						location.reload()
					})
					.onCancel(() => {
						// console.log('>>>> Cancel')
					})
					.onDismiss(() => {
						// console.log('I am triggered on both OK and Cancel')
					})
			},
			
			handleKeyDown(event) {
				if (event.altKey && event.ctrlKey && event.code == 'KeyS') {
					this.myFunction()
				}
			},
			
			checkInternetConnection() {
				this.hasInternet = navigator.onLine

				if (!this.hasInternet && !this.isDialogVisible) {
					// If no connection and dialog not visible, show dialog
					this.isDialogVisible = true
				} else if (this.hasInternet && this.isDialogVisible) {
					// If connection restored and dialog visible, close dialog
					this.isDialogVisible = false
				}
			},
			
			closeDialog() {
				// Method to manually close the dialog
				this.isDialogVisible = false
			},
			
			startInternetCheckInterval() {
				// Start interval to check connection every 5 seconds (you can adjust the value)
				this.checkInterval = setInterval(this.checkInternetConnection, 5000)
			},
			
			stopInternetCheckInterval() {
				// Stop the interval when no longer needed
				clearInterval(this.checkInterval)
			},
			
			async comprobarToken() {
				let respuesta = await this.checkToken()
				if (respuesta && respuesta.status === 'OK') {
					console.log('User authenticated')
					
					// Check for updates after authentication
					this.scheduleUpdateCheck();
				} else {
					console.error('Invalid token, redirecting to LoginLayout')
					this.$q.loading.hide()
					this.$router.push('/login')
				}
			},
			
			async checkToken() {
				try {
					let info = (await this.$rsNeDB('credenciales').find())[0]
					let data = await this.$db.funcAdmin('modules/ispt/obtainTenants', {
						token: info.authToken,
					})
					if (data.length) {
						this.SET_TOKEN(info.authToken)
						this.SET_USER(info.user)
						this.SET_USERID(info.id)
						return { status: 'OK' }
					} else return { status: 'FAIL' }
				} catch (err) {
					throw err
				}
			},
			
			// Schedule update check based on settings
			scheduleUpdateCheck() {
				try {
					// Load update settings from localStorage
					const savedSettings = localStorage.getItem('updateSettings');
					let settings = {
						checkAutomatically: true,
						checkIntervalHours: 24
					};
					
					if (savedSettings) {
						settings = { ...settings, ...JSON.parse(savedSettings) };
					}
					
					// If automatic checking is enabled
					if (settings.checkAutomatically) {
						// Get last check time
						const lastCheckTime = localStorage.getItem('lastUpdateCheck');
						const now = Date.now();
						
						if (!lastCheckTime || (now - parseInt(lastCheckTime)) > (settings.checkIntervalHours * 60 * 60 * 1000)) {
							// Check for updates silently (no notification if none available)
							setTimeout(() => {
								this.checkForUpdatesQuietly();
							}, 10000); // Delay for 10 seconds after login
							
							// Update last check time
							localStorage.setItem('lastUpdateCheck', now.toString());
						}
					}
				} catch (error) {
					console.error('Error scheduling update check:', error);
				}
			},
			
			// Check for updates without notification
			async checkForUpdatesQuietly() {
				if (this.$refs.updateDialog) {
					await this.$refs.updateDialog.checkForUpdates(false);
				}
			},
			
			cerrarVentana() {
				// Close the window in Electron
				const { remote } = require('electron')
				const ventanaActual = remote.getCurrentWindow()
				ventanaActual.close()
			},
			
			cerrarSesion() {
				this.$cmd.logout()
				this.$router.push('/login')
			},
			
			minimizeWindow() {
				electron.remote.getCurrentWindow().minimize()
			},
			
			maximizeWindow() {
				const currentWindow = electron.remote.getCurrentWindow()

				if (currentWindow.isMaximized()) {
					currentWindow.unmaximize()
					this.isMaximized = false
				} else {
					currentWindow.maximize()
					this.isMaximized = true
				}
			},
			
			startDrag(event) {
				if (event.button === 0) {
					this.dragging = true
					this.offsetX = event.screenX
					this.offsetY = event.screenY

					window.addEventListener('mousemove', this.dragWindow)
					window.addEventListener('mouseup', this.stopDrag)
				}
			},
			
			dragWindow(event) {
				if (this.dragging) {
					const currentWindow = electron.remote.getCurrentWindow()

					const newX = event.screenX - this.offsetX
					const newY = event.screenY - this.offsetY

					const [currentX, currentY] = currentWindow.getPosition()

					currentWindow.setPosition(currentX + newX, currentY + newY)

					this.offsetX = event.screenX
					this.offsetY = event.screenY
				}
			},
			
			stopDrag() {
				this.dragging = false
				window.removeEventListener('mousemove', this.dragWindow)
				window.removeEventListener('mouseup', this.stopDrag)
			},
		},
		
		async mounted() {
			if (!this.$q.localStorage.getItem('api')) this.$q.localStorage.set('api', 'server')
			document.addEventListener('keydown', this.handleKeyDown)
		},
		
		beforeDestroy() {
			document.removeEventListener('keydown', this.handleKeyDown)
			this.stopInternetCheckInterval()
		},
	}
</script>