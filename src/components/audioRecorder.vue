<template>
	<div class="q-pa-md main-container">
		<div ref="waveform" class="waveform"></div>
		<div class="controls">
			<q-btn v-if="!isRecording" @click="startRecording" color="red" round icon="mic" size="lg" />
			<q-btn v-else @click="stopRecording" color="red" round icon="stop" size="lg" />
		</div>
	</div>
</template>

<script>
	import WaveSurfer from 'wavesurfer.js'

	export default {
		props: {
			recordDuration: {
				type: Number,
				default: 3,
			},
		},
		data() {
			return {
				isRecording: false,
				audioBlob: null,
				recorder: null,
				wave: null,
				mediaStream: null,
			}
		},
		methods: {
			async startRecording() {
				this.isRecording = true
				this.audioBlob = null

				try {
					this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
					this.recorder = new MediaRecorder(this.mediaStream)
					const audioChunks = []

					this.recorder.ondataavailable = (event) => {
						audioChunks.push(event.data)
					}

					this.recorder.onstop = () => {
						this.audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
						this.wave.loadBlob(this.audioBlob)
						this.playRecording()
					}

					this.recorder.start()
					setTimeout(() => {
						if (this.isRecording) {
							this.stopRecording()
						}
					}, this.recordDuration * 1000)

					this.initWaveform()
				} catch (error) {
					console.error('Error accessing microphone:', error)
					this.isRecording = false
				}
			},
			stopRecording() {
				this.isRecording = false
				this.recorder.stop()
				this.mediaStream.getTracks().forEach((track) => track.stop())
			},
			playRecording() {
				if (this.audioBlob) {
					const audioUrl = URL.createObjectURL(this.audioBlob)
					const audio = new Audio(audioUrl)
					audio.volume = 1.0
					audio.play()
				}
			},
			initWaveform() {
				if (!this.wave) {
					this.wave = WaveSurfer.create({
						container: this.$refs.waveform,
						waveColor: 'violet',
						progressColor: 'purple',
						backend: 'MediaElement',
					})

					this.wave.microphone = Object.assign({}, WaveSurfer.Microphone)
					this.wave.microphone.init({
						wavesurfer: this.wave,
					})

					this.wave.microphone.on('deviceReady', (stream) => {
						//console.log('Device ready!', stream)
					})

					this.wave.microphone.on('deviceError', (code) => {
						console.warn('Device error: ' + code)
					})

					this.wave.microphone.start()
				}
				this.wave.empty()
			},
		},
		destroyed() {
			if (this.wave) {
				this.wave.microphone.stop()
				this.wave.destroy()
			}
		},
	}
</script>

<style scoped>
	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	.waveform {
		width: 100%;
		height: 100px;
	}

	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
	}

	.q-btn {
		margin: 0 10px;
	}
</style>
