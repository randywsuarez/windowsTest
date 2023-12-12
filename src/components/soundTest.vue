<template>
	<q-card class="reproductor-card card">
		<!-- ... (código existente) ... -->

		<q-card-section class="reproductor-content">
			<q-card-section>
				<div class="text-h6">Audio Test</div>
			</q-card-section>

			<q-separator />
			<q-card-section class="botones-reproductor">
				<q-btn
					@click="toggleReproduccion"
					:icon="isPlaying ? 'stop' : 'play_arrow'"
					class="play-btn"
					round
				/>
			</q-card-section>
		</q-card-section>

		<q-card-actions align="right">
			<q-btn flat color="red" label="FAIL" @click="detenerReproduccion(false)" />
			<q-btn flat color="green" label="PASS" @click="detenerReproduccion(true)" />
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
				ruta: 'Both.wav',
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
			toggleReproduccion() {
				// Alternar entre reproducción y pausa
				if (this.isPlaying) {
					this.detenerReproduccion('stop')
				} else {
					this.reproducirSonido('Play')
				}
			},
			async reproducirSonido(action) {
				/* // Pausar el audio actual antes de cambiar
				this.$refs.audioElement.pause()
				this.$refs.audioElement.currentTime = 0 */

				// Configurar la etiqueta actual para la fuente de audio
				this.currentAudioLabel = action
				const currentAudio = await this.buttons.find((btn) => btn.label == action)
				this.$refs.audioElement.src = this.ruta
				if (currentAudio) {
					this.ruta = currentAudio.audio
					// Reproducir el audio si la propiedad autoplay es verdadera
					if (this.autoplay) {
						for (let x = 0; x < 3; x++) {
							console.log('paso')
							this.reproducirAudio()
						}
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
			detenerReproduccion(a) {
				// Detener la reproducción al presionar "Fail" o "Pass"
				this.isPlaying = false
				this.$refs.audioElement.pause()
				this.$refs.audioElement.currentTime = 0
				if (!a == 'stop') this.$emit('respuesta', a)
			},
		},
		mounted() {
			if (this.autoplay) this.reproducirSonido('Play')
		},
	}
</script>

<style scoped>
	.reproductor-card {
		width: 250px;
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
	.card {
		border-radius: 15px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 90%; /* Ancho del contenedor al 80% del espacio disponible */
		position: relative; /* Agregado para posicionar correctamente el avatar */
		margin-top: 25px; /* Ajusta según sea necesario para dar espacio al div superior */
	}
	.q-card-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
