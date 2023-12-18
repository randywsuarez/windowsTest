<template>
	<div class="">
		<div class="botones-reproductor">
			<q-btn
				@click="toggleReproduccion"
				:icon="isPlaying ? 'stop' : 'play_arrow'"
				class="play-btn"
				round
			/>
		</div>
		<audio ref="audioElement" :src="ruta" @timeupdate="verificarFinReproduccion"></audio>
	</div>
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
					{ label: 'Play', audio: 'Both.wav' },
					{ label: 'Right', audio: 'Right.wav' },
				],
				ruta: 'Both.wav',
				isPlaying: false,
			}
		},
		computed: {
			audioSource() {
				const currentAudio = this.buttons.find((btn) => btn.label === this.currentAudioLabel)
				return currentAudio ? currentAudio.audio : ''
			},
		},
		methods: {
			toggleReproduccion() {
				if (this.isPlaying) {
					this.detenerReproduccion('stop')
				} else {
					this.reproducirSonido('Play')
				}
			},
			async reproducirSonido(action) {
				this.currentAudioLabel = action
				const currentAudio = await this.buttons.find((btn) => btn.label == action)
				this.$refs.audioElement.src = this.ruta
				if (currentAudio) {
					this.ruta = currentAudio.audio
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
				this.$refs.audioElement.play().catch((error) => {
					console.error('Error al reproducir el audio:', error.message)
				})
			},
			verificarFinReproduccion() {
				if (this.isPlaying && this.$refs.audioElement.currentTime >= this.$refs.audioElement.duration) {
					this.$refs.audioElement.currentTime = 0
					this.reproducirAudio()
				}
			},
			detenerReproduccion(a) {
				this.isPlaying = false
				this.$refs.audioElement.pause()
				this.$refs.audioElement.currentTime = 0
				console.log(a)
				if (!a == 'stop') this.$emit('respuesta', a)
			},
		},
		mounted() {
			if (this.autoplay) this.reproducirSonido('Play')
		},
	}
</script>

<style scoped>
	.reproductor-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 30vh; /* Esto asegura que ocupe el 100% de la altura de la ventana */
	}
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
	/* .card {
		border-radius: 15px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 90%;
		position: relative;
		margin-top: 25px;
	} */
	.q-card-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
