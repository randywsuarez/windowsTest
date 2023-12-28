<!-- FullScreenWindow.vue -->
<template>
	<div class="full-screen-window" :style="{ backgroundColor: currentColor }">
		<q-btn @click="failAction" label="FAIL" />
		<q-btn @click="passAction" label="PASS" />
	</div>
</template>

<script>
	export default {
		data() {
			return {
				colors: ['red', 'green', 'blue', 'white', 'black'],
				currentColorIndex: 0,
			}
		},
		computed: {
			currentColor() {
				return this.colors[this.currentColorIndex]
			},
		},
		methods: {
			failAction() {
				this.animateBackgroundColor()
				this.$emit('fail')
			},
			passAction() {
				this.animateBackgroundColor()
				this.$emit('pass')
			},
			animateBackgroundColor() {
				// Inicia la animación cambiando el color de fondo
				this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length

				// La animación completa después de 2 segundos (ajusta según tus necesidades)
				setTimeout(() => {
					// Restaura el color original
					this.currentColorIndex = 0
				}, 2000)
			},
		},
	}
</script>

<style scoped>
	.full-screen-window {
		/* Estilos para tu ventana de pantalla completa */
		transition: background-color 1s ease; /* Ajusta la duración y la función de temporización según tus necesidades */
	}
</style>
