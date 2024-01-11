<!-- src/components/MousePad.vue -->
<template>
	<div
		class="touchpad"
		:style="{ height: 'min(400px, 100%)' }"
		@contextmenu.prevent="handleRightClick"
		@click="handleLeftClick"
		@mounted="handleMount"
	>
		<div class="col row" style="height: 200px; background-color: #f0f0f0">
			<div class="col-12" style="height: 50px"></div>
			<div
				class="col-6 miboton"
				:class="{ 'green-button': buttonColor === 'green' && activeButton === 'left' }"
				id="izquierdo"
			></div>
			<div
				class="col-6 miboton"
				:class="{ 'green-button': buttonColor === 'green' && activeButton === 'right' }"
				id="derecho"
			></div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				buttonColor: 'default',
				activeButton: '', // Agregamos una propiedad para rastrear el botón activo
			}
		},
		methods: {
			handleRightClick() {
				this.buttonColor = 'green'
				this.activeButton = 'right' // Establecer el botón derecho como activo
			},
			handleLeftClick() {
				this.buttonColor = 'green'
				this.activeButton = 'left' // Establecer el botón izquierdo como activo
			},
			handleMount() {
				// Método llamado en el montaje para establecer el botón derecho como activo inicialmente
				this.buttonColor = 'green'
				this.activeButton = 'right'
			},
		},
	}
</script>

<style scoped>
	.touchpad {
		position: relative;
		width: 100%;
		max-height: 400px;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		background-color: #f0f0f0;
	}
	.miboton {
		height: 100px;
		border-radius: 5px;
		border: black;
		background-color: grey;
	}
	.green-button {
		background-color: green !important;
	}
</style>
