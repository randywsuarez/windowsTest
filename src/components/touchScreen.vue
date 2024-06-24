<!-- <template>
	<q-dialog v-model="dialog" persistent full-width full-height @keyup.esc="closeDialog">
		<q-card>
			<q-card-section class="text-center">
				<div class="grid-container">
					<div v-for="group in gridGroups" :key="group.id" class="grid-group">
						<div v-for="cell in group.cells" :key="cell.id" class="grid-cell">
							<q-btn
								v-if="cell.hasButton"
								:class="[cell.buttonClass, { blinking: cell.blinking }]"
								@click="toggleButton(cell)"
							/>
						</div>
					</div>
				</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script>
	export default {
		props: {
			showDialog: {
				type: Boolean,
				required: true,
			},
		},
		data() {
			return {
				dialog: false,
				gridGroups: this.generateGridGroups(),
			}
		},
		watch: {
			showDialog(newVal) {
				this.dialog = newVal
				if (newVal) {
					this.enterFullScreen()
				} else {
					this.exitFullScreen()
				}
			},
			dialog(newVal) {
				if (!newVal) {
					this.$emit('close', false)
				}
			},
		},
		methods: {
			enterFullScreen() {
				const docEl = document.documentElement
				if (docEl.requestFullscreen) {
					docEl.requestFullscreen()
				} else if (docEl.mozRequestFullScreen) {
					docEl.mozRequestFullScreen()
				} else if (docEl.webkitRequestFullscreen) {
					docEl.webkitRequestFullscreen()
				} else if (docEl.msRequestFullscreen) {
					docEl.msRequestFullscreen()
				}
			},
			exitFullScreen() {
				if (document.exitFullscreen) {
					document.exitFullscreen()
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen()
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen()
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen()
				}
			},
			closeDialog() {
				this.dialog = false
			},
			generateGridGroups() {
				const groups = []
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						const cells = []
						for (let k = 0; k < 3; k++) {
							for (let l = 0; l < 3; l++) {
								cells.push({
									id: `${i}-${j}-${k}-${l}`,
									hasButton: false,
									buttonClass: 'gray-button',
									blinking: false,
								})
							}
						}
						const randomCell = Math.floor(Math.random() * 9)
						cells[randomCell].hasButton = true
						groups.push({ id: `${i}-${j}`, cells })
					}
				}
				return groups
			},
			toggleButton(cell) {
				cell.buttonClass = 'green-button'
				cell.blinking = true
				setTimeout(() => {
					cell.blinking = false
				}, 1000)
			},
		},
		created() {
			document.addEventListener('keyup', this.handleKeyUp)
		},
		beforeDestroy() {
			document.removeEventListener('keyup', this.handleKeyUp)
		},
		methods: {
			handleKeyUp(event) {
				if (event.key === 'Escape') {
					this.closeDialog()
				}
			},
			toggleButton(cell) {
				cell.buttonClass = 'green-button'
				cell.blinking = true
				setTimeout(() => {
					cell.blinking = false
				}, 1000)
			},
			closeDialog() {
				this.dialog = false
			},
		},
	}
</script>

<style>
	.grid-container {
		display: flex;
		flex-wrap: wrap;
		width: 100vw;
		height: 100vh;
		background-color: white;
	}

	.grid-group {
		display: flex;
		flex-wrap: wrap;
		width: 33.33%;
		height: 33.33%;
		border: 1px solid transparent;
	}

	.grid-cell {
		width: 33.33%;
		height: 33.33%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.q-btn {
		width: 20px;
		height: 20px;
	}

	.green-button {
		background-color: green !important;
	}

	.gray-button {
		background-color: gray !important;
	}

	.blinking {
		animation: blinking-animation 1s infinite;
	}

	@keyframes blinking-animation {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
 -->
