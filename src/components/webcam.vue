<template>
		<div class="camera-container">
		<div v-if="showVideo" class="camera">
			<video ref="video" playsinline autoplay></video>
		</div>
		<canvas ref="canvas" style="display: none"></canvas>
    <div class="flex flex-center"><img v-if="showCapturedImage" :src="capturedImage" alt="Captured Image" class="captured-image" center /></div>
		<input type="hidden" ref="txtPhoto" />
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
				width: 0,
				height: 0,
				streaming: false,
				showVideo: true,
				capturedImage: '',
				showCapturedImage: false,
				videoStream: null,
				selectedCamera: null,
				cameras: [],
				countdown: 5, // Inicia el contador regresivo en 5 segundos
			}
		},
		mounted() {
			navigator.mediaDevices
				.enumerateDevices()
				.then(function (devices) {
					let videoDevices = devices.filter((device) => device.kind === 'videoinput')

					if (videoDevices.length > 0) {
						videoDevices.forEach((device, index) => {
							console.log(`Camera ${index + 1}: ${device.label} (ID: ${device.deviceId})`)
						})
					} else {
						console.log('No cameras found.')
					}
				})
				.catch(function (err) {
					console.error('Error enumerating devices: ', err)
				})

			this.startup()
			window.addEventListener('resize', this.setVideoDimensions)
		},
		beforeDestroy() {
			this.stopCapture()
			window.removeEventListener('resize', this.setVideoDimensions)
		},
		methods: {
			startup() {
				this.video = this.$refs.video
				this.canvas = this.$refs.canvas
				this.photo = this.$refs.photo
				this.txtPhoto = this.$refs.txtPhoto
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: false })
					.then((stream) => {
						this.video.srcObject = stream
						this.video.play()
					})
					.catch((err) => {
						console.error('An error occurred: ' + err)
						alert('An error occurred while accessing the camera: ' + err.message)
					})

				this.video.addEventListener('canplay', this.onCanPlay, false)
			},
			onCanPlay() {
				if (!this.streaming) {
					this.setVideoDimensions()
					this.streaming = true
					this.takePicture()
					this.stopCapture()
				}
			},
			setVideoDimensions() {
				this.width = this.video.clientWidth
				this.height = this.width * (9 / 16) // Aspecto 16:9

				if (isNaN(this.height)) {
					this.height = this.width / (4 / 3)
				}

				this.video.setAttribute('width', this.width)
				this.video.setAttribute('height', this.height)
				this.canvas.setAttribute('width', this.width)
				this.canvas.setAttribute('height', this.height)
			},
			stopCapture() {
				if (this.video.srcObject) {
					this.video.srcObject.getTracks().forEach((track) => track.stop())
				}
				this.showVideo = false
			},
			clearPhoto() {
				if (this.photo) {
					this.photo.setAttribute('src', '')
				}
			},
			takePicture() {
				const context = this.canvas.getContext('2d')
				if (this.width && this.height) {
					this.canvas.width = this.width
					this.canvas.height = this.height
					context.drawImage(this.video, 0, 0, this.width, this.height)

					const imageDataURL = this.canvas.toDataURL('image/jpeg')
					if (this.photo) {
						this.photo.setAttribute('src', imageDataURL)
					}
					if (this.txtPhoto) {
						this.txtPhoto.setAttribute('value', imageDataURL)
					}
					this.capturedImage = imageDataURL
					this.showCapturedImage = true
					this.showVideo = false

					if (this.imageName) {
						let res = {
							SerialNumber: this.imageName,
							EmployeeID: '',
							FileType: '2',
							fileExtension: '.jpg',
							fileBase64Str: imageDataURL.replace(/^data:image\/jpeg;base64,/, ''),
						}
						this.$emit('input', res)
					}
				} else {
					this.clearPhoto()
				}
			},
		},
	}
</script>

<style scoped>
	.camera-container {
		text-align: center;
	}

	.camera {
		position: relative;
		display: inline-block;
		width: 100%;
	}

	video {
		width: 100%;
		height: auto;
	}

	canvas {
		display: none;
	}

	.captured-image {
		max-height: 200px; /* Establece la altura máxima en 200px */
            overflow-y: auto; /* Añade una barra de desplazamiento vertical si el contenido excede la altura máxima */
            background-color: lightblue;
            padding: 10px;
  }
