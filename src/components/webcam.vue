<template>
	<div
		style="max-width: 50%; margin: 0 auto; transform: scale(0.8); transform-origin: center center"
	>
		<div class="grid-container" ref="gridContainer" :style="getGridTemplateStyle">
			<div v-for="(camera, index) in cameras" :key="camera.deviceId" class="grid-item">
				<div class="camera-wrapper">
					<video ref="video" :id="`video-${index}`" playsinline autoplay></video>
					<div class="camera-caption">
						{{ camera.label || `Camera ${index + 1}` }}
					</div>
				</div>
			</div>
		</div>
		<div id="kb_box_b" class="row justify-between q-pt-md" v-if="cameras.length">
			<q-btn color="red" icon="close" label="Fail" @click="handleFail" />
			<q-btn color="primary" label="Reset" @click="handleReset" />
			<q-btn color="green" icon="check" label="Pass" @click="handlePass" />
		</div>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'
	import { mapState, mapMutations } from 'vuex'

	export default {
		name: 'MultiCameraCapture',
		props: {
			value: {
				type: Object, // Only accept objects
				required: true,
			},
		},
		data() {
			return {
				cameras: [],
				results: [],
			}
		},
		computed: {
			...mapState('information', ['Webcam']),

			getGridTemplateStyle() {
				const numCameras = this.cameras.length
				if (numCameras === 1) {
					return 'grid-template-columns: repeat(1, 1fr);'
				} else if (numCameras === 2) {
					return 'grid-template-columns: repeat(2, 1fr);'
				} else {
					const columns = Math.ceil(Math.sqrt(numCameras))
					return `grid-template-columns: repeat(${columns}, 1fr);`
				}
			},
		},
		methods: {
			...mapMutations('information', ['SET_WEBCAM_STATUS']),

			async initializeCameras() {
				try {
					const devices = await navigator.mediaDevices.enumerateDevices()
					this.cameras = devices.filter(
						(device) =>
							device.kind === 'videoinput' && !device.label.toLowerCase().includes('infrared'),
					)

					if (this.cameras.length === 0) {
						this.handleNoCam()
						return
					}

					this.cameras.forEach(async (camera, index) => {
						try {
							const stream = await navigator.mediaDevices.getUserMedia({
								video: { deviceId: { exact: camera.deviceId } },
							})
							const videoElement = this.$refs.video[index]
							if (videoElement) {
								videoElement.srcObject = stream
								videoElement.onloadedmetadata = () => {
									videoElement.play()
								}
							}
						} catch (error) {
							console.error(`Error initializing camera ${camera.label}:`, error)
						}
					})
				} catch (error) {
					console.error('Error accessing camera devices:', error)
				}
			},

			async handlePass() {
				await this.captureGrid(true, 'Webcam test PASS')
			},

			async handleNoCam() {
				this.SET_WEBCAM_STATUS('NO') // 🔥 Corrección: Usar mutación en lugar de modificar `state` directamente
				await this.captureGrid(true, 'Webcam test PASS')
			},

			async handleFail() {
				await this.captureGrid(false, 'Webcam test FAIL')
			},

			async handleReset() {
				this.results = []
				await this.startAllCameras()
				this.emitResults()
			},

			async captureGrid(status, message) {
				await this.$nextTick() // 🔥 Corrección: Asegurar que el DOM se haya actualizado antes de capturar

				const gridElement = this.$refs.gridContainer
				if (!gridElement) {
					console.error('Grid container not found')
					return
				}

				try {
					const canvas = await html2canvas(gridElement)
					const base64Image = canvas.toDataURL('image/png')

					this.results = {
						status,
						message,
						base64: base64Image,
						ext: 'png',
						type: 'webcam',
					}

					await this.stopAllCameras()
					this.emitResults()
				} catch (error) {
					console.error('Error capturing webcam grid:', error)
				}
			},

			async stopAllCameras() {
				for (const [index, camera] of this.cameras.entries()) {
					const videoElement = this.$refs.video[index]
					if (videoElement) {
						const stream = videoElement.srcObject
						if (stream) {
							const tracks = stream.getTracks()
							tracks.forEach((track) => track.stop())
							videoElement.srcObject = null
						}
					}
				}
			},

			async startAllCameras() {
				await this.initializeCameras()
			},

			emitResults() {
				this.$emit('input', this.results)
			},
		},
		mounted() {
			this.initializeCameras()
		},
	}
</script>

<style>
	.grid-container {
		display: grid;
		gap: 10px;
		background-color: black;
		padding: 10px;
		max-height: 720px; /* Restrict max height */
		overflow: auto; /* Enable internal scrolling if necessary */
	}
	.grid-item {
		border: 2px solid white;
		border-radius: 8px;
		position: relative;
		overflow: hidden; /* Prevent content from overflowing outside the parent */
	}
	.camera-wrapper {
		text-align: center;
	}
	video {
		width: 70%;
		height: 70%;
		object-fit: cover; /* Ensure the video fits within the grid item */
		border-radius: 8px 8px 0 0;
	}
	.camera-caption {
		position: absolute;
		bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		text-align: center;
		padding: 5px 0;
		font-size: 14px;
		border-radius: 0 0 8px 8px;
	}
	.button-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
	}
	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	.btn-fail {
		background-color: red;
		color: white;
	}
	.btn-reset {
		background-color: blue;
		color: white;
	}
	.btn-pass {
		background-color: green;
		color: white;
	}
</style>
