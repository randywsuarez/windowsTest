<template>
	<div class="q-pa-md main-container">
		<canvas ref="waveCanvas" id="master" class="waveform"></canvas>
		<div class="controls">
			<q-btn
				v-if="!isRecording"
				@click="startRecording"
				:disabled="isRecording"
				color="red"
				round
				icon="mic"
				size="lg"
			/>
			<q-btn v-else @click="stopRecording" color="red" round icon="stop" size="lg" />
		</div>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'

	export default {
		props: {
			modelValue: Object, // Use v-model to bind the result
			recordDuration: {
				type: Number,
				default: 5, // Ensure the duration matches the visibility of the waveform
			},
		},
		emits: ['update:modelValue'],
		data() {
			return {
				isRecording: false,
				recordedAudio: null,
				waveCanvas: null,
				animationId: null,
				audioContext: null,
				analyser: null,
				dataArray: null,
				mediaStream: null,
				mediaStreamSource: null,
				recorder: null,
				audioChunks: [],
				state: {}, // State to persist test progress
			}
		},
		mounted() {
			console.debug('Component mounted: Initializing waveCanvas reference.')
			this.waveCanvas = this.$refs.waveCanvas
		},
		methods: {
			async startRecording() {
				console.debug('Start recording triggered.')
				try {
					this.isRecording = true // Disable the button immediately

					// Initialize Web Audio API
					this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
					this.analyser = this.audioContext.createAnalyser()
					this.analyser.fftSize = 2048
					const bufferLength = this.analyser.frequencyBinCount
					this.dataArray = new Uint8Array(bufferLength)

					// Access microphone
					this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
					this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream)
					this.mediaStreamSource.connect(this.analyser)

					// Initialize MediaRecorder
					this.recorder = new MediaRecorder(this.mediaStream)
					this.audioChunks = []
					this.recorder.ondataavailable = (event) => {
						this.audioChunks.push(event.data)
					}
					this.recorder.onstop = this.handleRecordingStop
					this.recorder.start()

					this.drawWaveform()

					setTimeout(() => {
						this.stopRecording()
					}, this.recordDuration * 1000)
				} catch (error) {
					console.error('Error starting recording:', error)
					this.isRecording = false // Re-enable the button if there's an error
					this.$q.notify({
						type: 'negative',
						message: 'Failed to access microphone. Please check permissions.',
					})
				}
			},

			stopRecording() {
				console.debug('Stop recording triggered.')
				this.isRecording = false
				if (this.animationId) {
					cancelAnimationFrame(this.animationId)
					console.debug('Animation frame cancelled.')
				}
				if (this.recorder && this.recorder.state !== 'inactive') {
					this.recorder.stop()
				}
				if (this.mediaStream) {
					const tracks = this.mediaStream.getTracks()
					tracks.forEach((track) => track.stop())
					console.debug('MediaStream tracks stopped.')
				}
				if (this.audioContext) {
					this.audioContext.close()
					console.debug('AudioContext closed.')
				}
			},

			async handleRecordingStop() {
				console.debug('Recording stopped, processing audio.')
				const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
				const audioUrl = URL.createObjectURL(audioBlob)
				const audio = new Audio(audioUrl)

				// Check if any audio was recorded
				const soundCaptured = this.audioChunks.length > 0
				console.debug('Sound captured:', soundCaptured)

				// Capture the element with id "master" as an image using html2canvas
				let waveImage = ''
				const masterElement = document.getElementById('master')
				if (masterElement) {
					try {
						const canvas = await html2canvas(masterElement)
						waveImage = canvas.toDataURL('image/png')
					} catch (error) {
						console.error('Error capturing element with html2canvas:', error)
					}
				} else {
					console.warn("Element with id 'master' not found.")
				}

				// Build JSON result
				const result = {
					status: soundCaptured,
					type: 'mic',
					ext: 'png',
					base64: waveImage,
					audioUrl, // URL para reproducir el audio
					duration: this.recordDuration, // Duración de la grabación
					timestamp: new Date().toISOString(), // Marca de tiempo
					audioSettings: {
						sampleRate: this.audioContext.sampleRate,
						fftSize: this.analyser.fftSize,
					},
					deviceInfo: this.mediaStream ? this.mediaStream.getAudioTracks()[0].label : 'Unknown',
					errorLogs: [], // Para registrar errores si ocurrieron
				}
				console.debug('Recording result:', result)

				// Persist state
				this.state = result

				// Emit result via v-model
				this.$emit('input', result)

				// Play audio if sound was captured
				if (soundCaptured) {
					audio.play()
				}
			},

			drawWaveform() {
				console.debug('Draw waveform triggered.')
				if (!this.analyser) {
					console.error('Analyser is not initialized.')
					return
				}

				const canvas = this.waveCanvas
				const canvasCtx = canvas.getContext('2d')

				// Adjust canvas height for better visibility
				canvas.width = canvas.offsetWidth
				canvas.height = 150 // Make the canvas taller

				const draw = () => {
					if (!this.isRecording) {
						console.debug('Recording stopped, exiting draw loop.')
						return
					}
					this.animationId = requestAnimationFrame(draw)

					this.analyser.getByteTimeDomainData(this.dataArray)
					canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
					canvasCtx.beginPath()

					// Adjust sliceWidth to ensure the waveform spans 5 seconds
					const sliceWidth = canvas.width / this.dataArray.length
					let x = 0

					for (let i = 0; i < this.dataArray.length; i++) {
						const v = this.dataArray[i] / 128.0
						const y = (v * canvas.height) / 2

						if (i === 0) {
							canvasCtx.moveTo(x, y)
						} else {
							canvasCtx.lineTo(x, y)
						}
						x += sliceWidth
					}

					canvasCtx.lineTo(canvas.width, canvas.height / 2)
					canvasCtx.strokeStyle = 'violet'
					canvasCtx.lineWidth = 2
					canvasCtx.stroke()
					console.debug('Waveform drawn on canvas.')
				}
				draw()
			},
		},
	}
</script>

<style scoped>
	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.waveform {
		width: 100%;
		height: 150px; /* Increased height for better visibility */
		margin-bottom: 20px;
		border: 1px solid #ccc;
	}
	.controls {
		display: flex;
		gap: 10px;
	}
</style>
