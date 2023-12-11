<template>
	<q-card>
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
			<q-btn flat color="red" label="FAIL" @click="$emit('respuesta', false)" />
			<q-btn flat color="green" label="PASS" @click="$emit('respuesta', true)" />
		</q-card-actions>

		<!-- Elemento de audio -->
		<audio ref="audioElement" :src="ruta"></audio>
	</q-card>
</template>

<script>
	export default {
		data() {
			return {
				buttons: [
					{ label: 'Left', audio: 'Left.wav' },
					{ label: 'Play', audio: 'Both.wav' }, // Cambiado a Both.wav
					{ label: 'Right', audio: 'Right.wav' },
				],
				ruta: '',
			}
		},
		computed: {
			// Obtener la fuente del audio basado en la acción actual
			audioSource() {
				const currentAudio = this.buttons.find((btn) => btn.label === this.currentAudioLabel)
				console.log(currentAudio.audio, this.currentAudioLabel)
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
				console.log(
					action,
					this.buttons.find((btn) => btn.label == action).audio,
					this.$refs.audioElement.readyState
				)
				this.ruta = this.buttons.find((btn) => btn.label == action).audio
				// Reproducir el audio
				if (this.$refs.audioElement.readyState >= 3) {
					this.reproducirAudio()
				}
			},
			reproducirAudio() {
				// Reproducir el audio
				this.$refs.audioElement.play().catch((error) => {
					// Manejar cualquier error durante la reproducción
					console.error('Error al reproducir el audio:', error.message)
				})
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
