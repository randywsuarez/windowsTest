<template>
	<q-card class="reproductor-card">
		<!-- ... (código existente) ... -->

		<q-card-section class="reproductor-content">
			<div class="botones-reproductor">
				<!-- Botones de reproducción -->
				<q-btn @click="reproducirSonido('Left')" icon="skip_previous" round />
				<q-btn @click="reproducirSonido('Play')" icon="play_arrow" class="play-btn" round />
				<q-btn @click="reproducirSonido('Right')" icon="skip_next" round />
			</div>
		</q-card-section>

		<q-card-actions align="right">
			<q-btn
				flat
				color="red"
				label="FAIL"
				@click="
					detenerReproduccion
					$emit('respuesta', false)
				"
			/>
			<q-btn
				flat
				color="green"
				label="PASS"
				@click="
					detenerReproduccion
					$emit('respuesta', true)
				"
			/>
		</q-card-actions>

		<!-- Elemento de audio -->
		<audio ref="audioElement" :src="ruta" @timeupdate="verificarFinReproduccion"></audio>
	</q-card>
</template>

<script>
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
					{ label: 'Play', audio: 'Both.wav' }, // Cambiado a Both.wav
					{ label: 'Right', audio: 'Right.wav' },
				],
				ruta: '',
				isPlaying: false,
			}
		},
		computed: {
			// Obtener la fuente del audio basado en la acción actual
			audioSource() {
				const currentAudio = this.buttons.find((btn) => btn.label === this.currentAudioLabel)
				return currentAudio ? currentAudio.audio : ''
			},
		},
		methods: {
			async reproducirSonido(action) {
				// Pausar el audio actual antes de cambiar
				this.$refs.audioElement.pause()
				this.$refs.audioElement.currentTime = 0

				// Configurar la etiqueta actual para la fuente de audio
				this.currentAudioLabel = action
				const currentAudio = this.buttons.find((btn) => btn.label == action)
				if (currentAudio) {
					console.log('Audio Source:', currentAudio.audio)
					this.ruta = currentAudio.audio

					// Reproducir el audio si la propiedad autoplay es verdadera
					if (this.autoplay) {
						this.reproducirAudio()
					}
				} else {
					console.error('No se encontró el audio para la acción:', action)
				}
			},

			reproducirAudio() {
				this.isPlaying = true
				// Reproducir el audio
				this.$refs.audioElement.play().catch((error) => {
					// Manejar cualquier error durante la reproducción
					console.log(this.ruta)
					console.error('Error al reproducir el audio:', error.message)
				})
			},
			verificarFinReproduccion() {
				// Verificar si el audio ha alcanzado el final y reiniciar la reproducción
				if (this.isPlaying && this.$refs.audioElement.currentTime >= this.$refs.audioElement.duration) {
					this.$refs.audioElement.currentTime = 0
					this.reproducirAudio()
				}
			},
			detenerReproduccion() {
				// Detener la reproducción al presionar "Fail" o "Pass"
				this.isPlaying = false
			},
		},
	}
</script>

<style scoped>
	.reproductor-card {
		width: 300px;
	}

	.reproductor-header {
		padding: 15px;
		background: #007bff;
		color: #fff;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.reproductor-title {
		font-size: 18px;
		font-weight: bold;
	}

	.reproductor-content {
		padding: 15px;
		text-align: center;
	}

	.botones-reproductor {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.play-btn {
		font-size: 24px;
	}

	.reproductor-actions {
		padding: 15px;
	}
</style>
