<template>
	<div class="app-container">
		<div
			:style="{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }"
			class="row justify-center q-pt-md"
			v-if="!testDecided"
		>
			Is the unit touch screen?
		</div>

		<div v-show="!testStarted && !testDecided" class="row justify-center q-pt-md">
			<q-btn label="Yes" color="primary" class="start-button" @click="confirmTouchScreen(true)" />
			<q-btn label="No" color="negative" class="reset-button" @click="confirmTouchScreen(false)" />
		</div>
		<div
			:style="{ color: test.status ? 'green' : 'red' }"
			class="row justify-center q-pt-md"
			v-if="!testDecided"
		>
			{{ test.message || 'Please select an option to proceed' }}
		</div>
		<div
			class="fullscreen-test no-scroll"
			:class="{ 'active-test': testStarted }"
			v-show="testStarted"
		>
			<q-page ref="testGrid" class="test-grid" id="test">
				<div
					v-for="(cell, index) in grid"
					:key="index"
					:class="[
						'grid-cell',
						cell.disabled ? 'disabled-cell' : '',
						cell.active ? 'active-cell' : '',
						cell.highlighted ? 'highlighted-cell' : '',
					]"
					@click="handleCellClick(index)"
				/>
			</q-page>
			<div class="exit-message">Press Esc to exit full screen</div>
		</div>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'

	export default {
		props: {
			highlightCount: {
				type: Number,
				default: 5,
			},
		},
		data() {
			return {
				grid: [],
				rows: 20,
				cols: 20,
				testStarted: false,
				testDecided: false,
				test: {},
			}
		},
		mounted() {
			document.addEventListener('keydown', this.handleEscapeKey)
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.handleEscapeKey)
		},
		methods: {
			confirmTouchScreen(isTouchScreen) {
				this.testDecided = true
				if (isTouchScreen) {
					this.startTest()
				} else {
					this.test = {
						status: true,
					}
					localStorage.setItem('touchscreenState', JSON.stringify(this.test))
					this.$emit('input', this.test)
				}
			},
			initializeGrid() {
				this.grid = Array.from({ length: this.rows * this.cols }, () => ({
					active: false,
					highlighted: false,
					disabled: true,
				}))
				this.randomlyHighlightCells()
			},
			randomlyHighlightCells() {
				const totalCells = this.rows * this.cols
				const indices = Array.from({ length: totalCells }, (_, i) => i)
				const selectedIndices = this.shuffleArray(indices).slice(0, this.highlightCount)
				selectedIndices.forEach((index) => {
					this.grid[index].highlighted = true
					this.grid[index].disabled = false
				})
			},
			shuffleArray(array) {
				for (let i = array.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1))
					;[array[i], array[j]] = [array[j], array[i]]
				}
				return array
			},
			handleCellClick(index) {
				if (this.grid[index].highlighted) {
					this.grid[index].highlighted = false
					this.grid[index].active = true
					const allClicked = this.grid.every((cell) => !cell.highlighted || cell.active)
					if (allClicked) {
						this.captureScreen(true)
					}
				}
			},
			startTest() {
				this.testStarted = true
				this.toggleFullScreen()
				this.initializeGrid()
			},
			resetTest() {
				this.testStarted = false
				this.grid = []
				document.exitFullscreen()
			},
			toggleFullScreen() {
				if (!document.fullscreenElement) {
					document.documentElement.requestFullscreen()
					document.body.style.overflow = 'hidden'
				} else {
					document.exitFullscreen()
					document.body.style.overflow = ''
				}
			},
			async captureScreen(status) {
				// Obtener el elemento por su ID
				const test = document.getElementById('test')

				// Verificar que el elemento exista y esté en el documento
				if (test && document.body.contains(test)) {
					// Esperar a que el DOM se actualice completamente (opcional, pero recomendado)
					await this.$nextTick()

					try {
						const canvas = await html2canvas(test)
						const base64Image = canvas.toDataURL('image/png')
						this.test = {
							ext: 'png',
							base64: base64Image,
							type: 'touchscreen',
							status: status,
							message: status ? 'Touch screen test PASS' : 'Touch screen test FAIL',
						}
						localStorage.setItem(
							'touchscreenState',
							JSON.stringify({ grid: this.grid, screenshot: this.test }),
						)

						this.$emit('input', this.test)
						this.testStarted = false
						this.testDecided = false // Permite volver a la pantalla inicial
						this.exitFullScreen()
					} catch (error) {
						console.error('Error capturing image:', error)
					}
				} else {
					console.error('El elemento con id "test" no está adjunto al DOM.')
				}
			},
			exitFullScreen() {
				if (document.fullscreenElement) {
					document.exitFullscreen()
				}
				document.body.style.overflow = ''
				this.testStarted = false
			},
			handleEscapeKey(event) {
				if (event.key === 'Escape' && this.testStarted) {
					this.captureScreen(false)
					this.exitFullScreen()
				}
			},
		},
	}
</script>

<style scoped>
	.app-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.fullscreen-test {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #2c3e50;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: 9999;
		transition: background-color 0.3s;
	}

	.no-scroll {
		overflow: hidden;
	}

	.fullscreen-test.active-test {
		background-color: #2c3e50;
		justify-content: stretch;
		align-items: stretch;
	}

	.exit-message {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		text-align: center;
		z-index: 1001; /* Ensure it is above other elements */
		pointer-events: none; /* Prevent interaction */
	}

	.start-screen {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh; /* Ensure it spans the full viewport height */
		background-color: white;
		z-index: 10; /* Ensure it appears above other elements */
		position: relative;
	}

	.start-button {
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		transition: background-color 0.3s ease;
		margin: 5px;
	}

	.start-button:hover {
		background-color: #45a049;
	}

	.start-button:active {
		background-color: #3e8e41;
	}

	.reset-button {
		background-color: #f44336;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		transition: background-color 0.3s ease;
		margin: 5px;
	}

	.reset-button:hover {
		background-color: #e53935;
	}

	.reset-button:active {
		background-color: #d32f2f;
	}

	.test-grid {
		display: grid;
		grid-template-columns: repeat(20, 1fr);
		grid-template-rows: repeat(20, 1fr);
		gap: 2px;
		width: 100%;
		height: 100%;
		justify-items: stretch;
		align-items: stretch;
	}

	.grid-cell {
		width: 100%;
		height: 100%;
		background-color: white;
		border: 1px solid black;
		cursor: pointer;
	}

	.active-cell {
		background-color: green;
	}

	.highlighted-cell {
		background-color: red;
	}

	.disabled-cell {
		background-color: #ccc;
		cursor: not-allowed;
	}
</style>
