<template>
	<div>
		<div
			style="max-width: 50%; margin: 0 auto; transform: scale(0.8); transform-origin: center center"
		>
			<div class="grid-container" :style="getGridTemplateStyle">
				<div v-for="(camera, index) in cameras" :key="camera.deviceId" class="grid-item">
					<div class="camera-wrapper">
						<video ref="video" :id="`video-${index}`" playsinline autoplay></video>
						<canvas ref="canvas" :id="`canvas-${index}`" style="display: none"></canvas>
						<div class="camera-caption">
							{{ camera.label || `Camera ${index + 1}` }}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="kb_box_b" class="row justify-between q-pt-md">
			<q-btn color="red" icon="close" label="Fail" @click="handleFail" />
			<q-btn color="primary" label="Reset" @click="handleReset" />
			<q-btn color="green" icon="check" label="Pass" @click="handlePass" />
		</div>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'

	export default {
		name: 'MultiCameraCapture',
		props: {
			value: {
				type: Array,
				required: true,
			},
		},
		data() {
			return {
				cameras: [],
				capturedImages: [],
				results: [],
			}
		},
		computed: {
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
			async initializeCameras() {
				const devices = await navigator.mediaDevices.enumerateDevices()
				this.cameras = devices.filter(
					(device) =>
						device.kind === 'videoinput' && !device.label.toLowerCase().includes('infrared'),
				)

				this.cameras.forEach(async (camera, index) => {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: { deviceId: { exact: camera.deviceId } },
					})
					const videoElement = this.$refs.video[index]
					videoElement.srcObject = stream
					videoElement.onloadedmetadata = () => {
						videoElement.play()
						this.waitForFocus(videoElement, index)
					}
					this.results.push({
						status: null,
						message: '',
						base64: '',
						ext: 'png',
						type: 'webcam',
					})
				})
			},
			waitForFocus(videoElement, index) {
				setTimeout(() => {
					if (this.isVideoReady(videoElement)) {
						this.captureImage(index)
					} else {
						this.waitForFocus(videoElement, index)
					}
				}, 500)
			},
			isVideoReady(videoElement) {
				const canvas = document.createElement('canvas')
				const context = canvas.getContext('2d')
				canvas.width = videoElement.videoWidth
				canvas.height = videoElement.videoHeight
				context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

				const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
				const pixels = imageData.data
				let totalBrightness = 0
				for (let i = 0; i < pixels.length; i += 4) {
					totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
				}
				const avgBrightness = totalBrightness / (pixels.length / 4)
				return avgBrightness > 50 && avgBrightness < 200
			},
			captureImage(index) {
				const videoElement = this.$refs.video[index]
				const canvasElement = this.$refs.canvas[index]
				const context = canvasElement.getContext('2d')
				canvasElement.width = videoElement.videoWidth
				canvasElement.height = videoElement.videoHeight
				context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
				this.capturedImages[index] = canvasElement.toDataURL('image/png')
			},
			handlePass(index) {
				this.results[index].status = true
				this.results[index].message = 'Webcam test PASS'
				this.captureRow(index)
			},
			handleFail(index) {
				this.results[index].status = false
				this.results[index].message = 'Webcam test FAIL'
				this.captureRow(index)
			},
			handleReset(index) {
				this.results[index].status = null
				this.results[index].message = ''
				this.results[index].base64 = ''
				this.emitResults()
			},
			async handlePassAll() {
				for (let index = 0; index < this.results.length; index++) {
					this.handlePass(index)
				}
			},
			async handleFailAll() {
				for (let index = 0; index < this.results.length; index++) {
					this.handleFail(index)
				}
			},
			async handleResetAll() {
				for (let index = 0; index < this.results.length; index++) {
					this.handleReset(index)
				}
			},
			async captureRow(index) {
				const element = this.$refs[`video-${index}`][0].parentNode
				const canvas = await html2canvas(element)
				this.results[index].base64 = canvas.toDataURL('image/png')
				this.emitResults()
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
		width: 100%;
		height: 100%;
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
