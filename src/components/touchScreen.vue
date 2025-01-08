<template>
	<div class="app-container">
		<div v-show="!testStarted" class="row justify-center q-pt-md">
			<button v-show="!testStarted" class="start-button" @click="startTest">Start</button>
			<button v-show="testStarted" class="reset-button" @click="resetTest">Reset</button>
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
			}
		},
		mounted() {
			document.addEventListener('keydown', this.handleEscapeKey)
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.handleEscapeKey)
		},
		methods: {
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
				let test = this.$el.querySelector('#test')
				console.log(test)
				if (test) {
					try {
						const canvas = await html2canvas(test)
						const base64Image = canvas.toDataURL('image/png')
						const jsonResult = {
							ext: 'png',
							base64: base64Image,
							type: 'touchscreen',
							status: status,
							message: status ? 'Touch screen test PASS' : 'Touch screen test FAIL',
						}
						localStorage.setItem(
							'touchscreenState',
							JSON.stringify({ grid: this.grid, screenshot: jsonResult }),
						)
						this.$emit('input', jsonResult)
						this.exitFullScreen()
					} catch (error) {
						console.error('Error capturing image:', error)
					}
				} else {
					console.error('SVG element not found for capturing.')
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
		z-index: 9999;
		transition: background-color 0.3s;
	}

	.no-scroll {
		overflow: hidden;
	}

	.fullscreen-test.active-test {
		background-color: #2c3e50;
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
		transform: translateX(-50%);
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		font-size: 16px;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		transition: background-color 0.3s ease;
		outline: none;
	}

	.start-button:hover {
		background-color: #45a049;
	}

	.start-button:active {
		background-color: #3e8e41;
	}

	.reset-button {
		transform: translateX(-50%);
		background-color: #f44336;
		color: white;
		border: none;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		font-size: 16px;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		transition: background-color 0.3s ease;
		margin-left: 10px;
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
		gap: 2px;
		width: 100%;
		height: 100%;
	}

	.grid-cell {
		width: 100%;
		aspect-ratio: 1 / 1;
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
