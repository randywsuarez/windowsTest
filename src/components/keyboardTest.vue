<template>
	<q-card class="teclado-card">
		<q-card-section class="teclado-section">
			<div class="teclado" :style="{ transform: zoomLevel }">
				<div v-for="fila in filas" :key="fila" class="fila q-mb-sm">
					<div v-for="tecla in fila" :key="tecla" class="tecla q-pa-xs" @click="highlightKey(tecla)">
						{{ tecla }}
					</div>
				</div>
			</div>
		</q-card-section>
	</q-card>
</template>

<script>
	export default {
		data() {
			return {
				filas: [
					[
						'Esc',
						'F1',
						'F2',
						'F3',
						'F4',
						'F5',
						'F6',
						'F7',
						'F8',
						'F9',
						'F10',
						'F11',
						'F12',
						'Print Scrn',
					],
					['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
					['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
					['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
					['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '↑', 'Num Lock', '*'],
					['Ctrl', 'Win', 'Alt', ' ', 'Alt', 'Ctrl', '←', '↓', '→', '7', '8', '9', '-'],
					[' ', ' ', ' ', '0', '.', 'Enter', '+'],
				],
				zoomLevel: 'scale(0.4)',
			}
		},
		methods: {
			highlightKey(tecla) {
				// Restablecer el estilo de todas las teclas
				this.$el.querySelectorAll('.tecla').forEach((key) => {
					key.style.boxShadow = 'none'
				})

				// Resaltar la tecla seleccionada
				const teclaElement = this.$el.querySelector(`.tecla:contains('${tecla}')`)
				if (teclaElement) {
					teclaElement.style.boxShadow = '0 0 10px rgba(0, 128, 0, 0.8)'
				}
			},
		},
	}
</script>

<style scoped>
	@media (max-width: 300px) {
		.teclado-card {
			max-width: 100%;
		}
	}
	.teclado-card {
		border-radius: 20px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		margin: auto;
		transition: transform 0.3s ease-in-out;
	}

	.teclado-section {
		padding: 20px;
	}

	.teclado {
		display: grid;
		grid-gap: 5px;
	}

	.fila {
		display: flex;
	}

	.tecla {
		flex: 1;
		padding: 15px;
		text-align: center;
		border-radius: 5px;
		cursor: pointer;
		transition: box-shadow 0.3s ease-in-out;
		font-size: 14px;
	}

	.tecla:hover {
		box-shadow: 0 0 10px rgba(0, 128, 0, 0.8);
	}
</style>
