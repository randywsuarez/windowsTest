<!-- src/components/CamaraCapture.vue -->
<template>
	<div style="transform: scale(0.5)">
		<!-- Menú desplegable para seleccionar la cámara -->
		<!-- <q-select
			v-model="selectedCamera"
			:options="cameraOptions"
			label="Seleccionar cámara"
			@input="changeCamera"
		/> -->

		<!-- Elemento de video para mostrar la transmisión de la cámara -->
		<video v-show="showVideo" ref="video" width="400" height="300" autoplay></video>
		<img v-show="showCapturedImage" :src="capturedImage" alt="Captured Image" style="width: 200px" />

		<!-- Contador regresivo -->
		<div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
	</div>
</template>

<script>
	export default {
		name: 'CamaraCapture', // Nombre del componente
		props: {
			imageName: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				capturedImage: '',
				showCapturedImage: false,
				showVideo: true,
				videoStream: null,
				selectedCamera: null,
				cameras: [],
				countdown: 5, // Inicia el contador regresivo en 5 segundos
			}
		},
		mounted() {
			this.initializeCamera()
			this.startCountdown()
			this.$parent.$on('stopCamera', () => {
				this.stopCamera()
			})
		},
		beforeDestroy() {
			this.stopCamera()
		},
		watch: {
			selectedCamera() {
				this.changeCamera()
			},
		},
		methods: {
			initializeCamera() {
				navigator.mediaDevices
					.enumerateDevices()
					.then((devices) => {
						this.cameras = devices.filter((device) => device.kind === 'videoinput')

						if (this.cameras.length > 0) {
							this.selectedCamera = this.cameras[0].deviceId
							this.changeCamera()
						} else {
							console.warn('No se encontraron cámaras disponibles.')
						}
					})
					.catch((error) => {
						console.error('Error al enumerar dispositivos:', error)
					})
			},
			stopCamera() {
				if (this.videoStream) {
					// Pausar la reproducción del video
					this.$refs.video.pause()

					// Detener todas las pistas de la transmisión de la cámara
					this.videoStream.getTracks().forEach((track) => track.stop())
				}
			},
			changeCamera() {
				this.stopCamera()

				navigator.mediaDevices
					.getUserMedia({
						video: {
							deviceId: this.selectedCamera ? { exact: this.selectedCamera } : undefined,
						},
					})
					.then((stream) => {
						this.videoStream = stream
						this.$refs.video.srcObject = stream
					})
					.catch((error) => {
						console.error('Error al acceder a la cámara:', error)
					})
			},
			startCountdown() {
				const countdownInterval = setInterval(() => {
					this.countdown--

					if (this.countdown === 0) {
						clearInterval(countdownInterval)
						this.myPic() // Llama a la función myPic() al llegar a cero el contador
					}
				}, 1000)
			},
			myPic() {
				let res = {
					SerialNumber: this.imageName,
					EmployeeID: '',
					FileType: '1',
					fileExtension: '.jpg',
					fileBase64Str: '',
				}
				// Captura la imagen y guarda el valor base64 en una variable
				const canvas = document.createElement('canvas')
				const context = canvas.getContext('2d')
				canvas.width = this.$refs.video.videoWidth
				canvas.height = this.$refs.video.videoHeight
				context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height)
				const imageDataURL = canvas.toDataURL('image/jpeg')

				// Imprime el valor base64 en la consola
				//console.log('Imagen capturada:', imageDataURL)
				this.capturedImage = imageDataURL
				this.showCapturedImage = true
				this.showVideo = false
				console.log(this.imageName)
				if (this.imageName) {
					this.$uploadImage(`${this.imageName}.jpg`, imageDataURL)
					res.fileBase64Str = imageDataURL.replace(/^data:image\/jpeg;base64,/, '')
					this.$emit('input', res)
					this.stopCamera()
				}
			},
			captureImage() {
				this.showVideo = true
				this.myPic()
			},
			async recargarComponente() {
				this.showVideo = true
				this.showCapturedImage = false
				this.initializeCamera()
				this.startCountdown()
			},
		},
		computed: {
			cameraOptions() {
				return this.cameras.map((camera) => ({
					label: camera.label || `Cámara ${this.cameras.indexOf(camera) + 1}`,
					value: camera.deviceId,
				}))
			},
		},
	}
</script>

<style scoped>
	/* Agrega estilos si es necesario */
	.countdown {
		position: absolute;
		top: 10px;
		right: 10px;
		font-size: 24px;
		color: #fff;
		background-color: #000;
		padding: 10px;
		border-radius: 5px;
	}
</style>
