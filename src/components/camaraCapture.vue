<template>
	<div>
		<!-- Mostrar el selector solo si hay más de una cámara disponible -->
		<q-select
			v-if="cameraOptions.length > 1"
			v-model="selectedCamera"
			:options="cameraOptions"
			label="Select Camera"
			@input="changeCamera"
		/>

		<!-- Elemento de video para mostrar la transmisión de la cámara -->
		<video ref="video" width="400" height="300" autoplay playsinline></video>
		<img
			v-show="showCapturedImage"
			:src="capturedImage"
			alt="Captured Image"
			style="width: 200px"
		/>
	</div>
</template>

<script>
	export default {
		name: 'CamaraCapture',
		data() {
			return {
				capturedImage: '',
				showCapturedImage: false,
				videoStream: null,
				selectedCamera: null,
				cameras: [],
				cameraOptions: [],
			}
		},
		mounted() {
			this.getCameras()
		},
		beforeDestroy() {
			this.stopCamera()
		},
		methods: {
			// Obtiene las cámaras disponibles
			getCameras() {
				navigator.mediaDevices
					.enumerateDevices()
					.then((devices) => {
						this.cameras = devices.filter((device) => device.kind === 'videoinput')
						this.cameraOptions = this.cameras.map((camera) => ({
							label: camera.label,
							value: camera.deviceId,
						}))

						// Selecciona la primera cámara por defecto y comienza la transmisión
						if (this.cameraOptions.length > 0) {
							this.selectedCamera = this.cameraOptions[0].value
							this.startCamera()
						}
					})
					.catch((err) => {
						console.error('Error accessing cameras: ', err)
						alert('No se pudo acceder a la cámara: ' + err.message)
					})
			},

			// Inicia la cámara seleccionada
			startCamera() {
				if (this.selectedCamera) {
					const constraints = {
						video: {
							deviceId: { exact: this.selectedCamera },
							brightness: 0.7, // Ajustar brillo si es compatible
							contrast: 0.8, // Ajustar contraste si es compatible
							exposureMode: 'auto', // Configuración de exposición automática
							exposureCompensation: 0.5, // Compensación de exposición si es compatible
						},
					}
					navigator.mediaDevices
						.getUserMedia(constraints)
						.then((stream) => {
							this.videoStream = stream
							this.$refs.video.srcObject = stream
						})
						.catch((err) => {
							console.error('Error starting camera: ', err)
							alert('No se pudo iniciar la cámara: ' + err.message)
						})
				}
			},

			// Cambia la cámara seleccionada y reinicia el flujo
			changeCamera() {
				this.stopCamera()
				this.startCamera()
			},

			// Detiene la cámara actual
			stopCamera() {
				if (this.videoStream) {
					const tracks = this.videoStream.getTracks()
					tracks.forEach((track) => track.stop())
				}
			},
		},
	}
</script>
