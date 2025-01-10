<template>
	<div class="reproductor-container">
		<div class="botones-reproductor">
			<q-btn
				@click="toggleReproduccion"
				:icon="isPlaying ? 'stop' : 'play_arrow'"
				class="play-btn"
				round
			/>
		</div>
		<canvas ref="visualizer" width="600" height="300" class="visualizer-canvas"></canvas>

		<!-- Botones debajo del canvas -->
		<div id="kb_box_b" class="row justify-between q-pt-md">
			<q-btn color="red" icon="close" label="Fail" @click="handleFail" />
			<q-btn color="primary" label="Reset" @click="handleReset" />
			<q-btn color="green" icon="check" label="Pass" @click="handlePass" />
		</div>
		<audio ref="audioElement" :src="ruta" loop></audio>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'

	export default {
		props: {
			autoplay: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				buttons: [
					{ label: 'Left', audio: 'Left.wav' },
					{ label: 'Play', audio: 'Both.wav' },
					{ label: 'Right', audio: 'Right.wav' },
				],
				ruta: 'Both.wav',
				isPlaying: false,
				audioContext: null,
				analyser: null,
				canvasContext: null,
				dataArray: null,
				bufferLength: null,
				animationId: null,
				testState: null, // Estado del test
			}
		},
		methods: {
			toggleReproduccion() {
				if (this.isPlaying) {
					this.detenerReproduccion()
				} else {
					this.reproducirSonido('Play')
				}
			},
			async reproducirSonido(action) {
				const currentAudio = this.buttons.find((btn) => btn.label === action)
				if (currentAudio) {
					this.ruta = currentAudio.audio
					this.$refs.audioElement.src = this.ruta
					this.iniciarVisualizacion()
					this.reproducirAudio()
				} else {
					console.error('No se encontró el audio para la acción:', action)
				}
			},
			reproducirAudio() {
				this.isPlaying = true
				this.$refs.audioElement.play().catch((error) => {
					console.error('Error al reproducir el audio:', error.message)
				})
			},
			detenerReproduccion() {
				this.isPlaying = false
				this.$refs.audioElement.pause()
				this.$refs.audioElement.currentTime = 0
				cancelAnimationFrame(this.animationId)
			},
			iniciarVisualizacion() {
				if (!this.audioContext) {
					this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
					const source = this.audioContext.createMediaElementSource(this.$refs.audioElement)
					this.analyser = this.audioContext.createAnalyser()
					this.analyser.fftSize = 256

					source.connect(this.analyser)
					this.analyser.connect(this.audioContext.destination)

					this.bufferLength = this.analyser.frequencyBinCount
					this.dataArray = new Uint8Array(this.bufferLength)

					const canvas = this.$refs.visualizer
					this.canvasContext = canvas.getContext('2d')
				}

				this.visualizar()
			},
			visualizar() {
				const canvas = this.$refs.visualizer
				const ctx = this.canvasContext

				const draw = () => {
					this.animationId = requestAnimationFrame(draw)

					ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
					ctx.fillRect(0, 0, canvas.width, canvas.height)

					this.analyser.getByteFrequencyData(this.dataArray)

					const barWidth = (canvas.width / this.bufferLength) * 2.5
					let x = 0

					for (let i = 0; i < this.bufferLength; i++) {
						const barHeight = this.dataArray[i] / 2

						ctx.fillStyle =
							i < this.bufferLength / 2 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)'
						ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

						x += barWidth + 1
					}
				}

				draw()
			},
			async captureImage(status) {
				const canvasElement = this.$refs.visualizer

				const canvasCapture = await html2canvas(canvasElement)
				const base64Image = canvasCapture.toDataURL('image/png')

				const response = {
					status: status === 'pass',
					message: `Speaker test ${status === 'pass' ? 'PASS' : 'FAIL'}`,
					base64: base64Image.split(',')[1],
					ext: 'png',
					type: 'speaker',
				}

				this.testState = response // Guardar estado
				this.saveState() // Guardar en localStorage

				this.$emit('input', response)
			},
			handlePass() {
				this.detenerReproduccion() // Detener reproducción
				this.captureImage('pass') // Capturar imagen y emitir estado
			},
			handleFail() {
				this.detenerReproduccion() // Detener reproducción
				this.captureImage('fail') // Capturar imagen y emitir estado
			},
			handleReset() {
				this.detenerReproduccion()
				this.testState = null // Limpiar estado
				this.saveState() // Actualizar localStorage
				this.$emit('input', null)
			},
			saveState() {
				if (this.testState) {
					localStorage.setItem('testState', JSON.stringify(this.testState))
				} else {
					localStorage.removeItem('testState')
				}
			},
			loadState() {
				const savedState = localStorage.getItem('testState')
				if (savedState) {
					this.testState = JSON.parse(savedState)
					this.$emit('input', this.testState) // Emitir estado restaurado al padre
				}
			},
		},
		mounted() {
			this.loadState() // Recuperar estado al cargar el componente
			if (this.autoplay && !this.testState) this.reproducirSonido('Play')
		},
		beforeDestroy() {
			cancelAnimationFrame(this.animationId)
			if (this.audioContext) {
				this.audioContext.close()
			}
		},
	}
</script>

<style scoped>
	.reproductor-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.visualizer-canvas {
		border: 1px solid #ccc;
		background-color: #000;
		margin-top: 20px;
	}
	#kb_box_b {
		width: 100%;
		max-width: 600px;
		margin-top: 20px;
	}
	.play-btn {
		font-size: 24px;
	}
</style>
