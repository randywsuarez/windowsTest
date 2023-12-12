<!-- src/components/CamaraCapture.vue -->
<template>
	<div>
		<!-- Menú desplegable para seleccionar la cámara -->
		<!-- <q-select
			v-model="selectedCamera"
			:options="cameraOptions"
			label="Seleccionar cámara"
			@input="changeCamera"
		/> -->

		<!-- Elemento de video para mostrar la transmisión de la cámara -->
		<video ref="video" width="400" height="300" autoplay></video>
		<img v-if="showCapturedImage" :src="capturedImage" alt="Captured Image" />

		<!-- Contador regresivo -->
		<div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
	</div>
</template>

<script>
	export default {
		name: 'CamaraCapture', // Nombre del componente
		data() {
			return {
				capturedImage: '',
				showCapturedImage: false,
				videoStream: null,
				selectedCamera: null,
				cameras: [],
				countdown: 5, // Inicia el contador regresivo en 5 segundos
			}
		},
		mounted() {
			this.initializeCamera()
			this.startCountdown()
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
				// Captura la imagen y guarda el valor base64 en una variable
				const canvas = document.createElement('canvas')
				const context = canvas.getContext('2d')
				canvas.width = this.$refs.video.videoWidth
				canvas.height = this.$refs.video.videoHeight
				context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height)
				const imageDataURL = canvas.toDataURL('image/jpeg')

				// Imprime el valor base64 en la consola
				console.log('Imagen capturada:', imageDataURL)
				this.capturedImage = imageDataURL
				this.showCapturedImage = true
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
