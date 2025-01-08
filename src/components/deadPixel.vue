<template>
	<div class="app-container">
		<!-- Test Control Buttons -->
		<div v-show="!testStarted" class="row justify-center q-pt-md">
			<button v-show="!testStarted" class="start-button" @click="startTest">Start</button>
		</div>

		<!-- Fullscreen Color Test -->
		<div
			v-show="testStarted"
			class="fullscreen-test no-scroll"
			:style="{ backgroundColor: currentColor }"
			ref="fullscreenElement"
		>
			<div class="button-container">
				<button
					v-show="showButtons"
					class="fail-button"
					:style="{ borderColor: contrastColor }"
					@click="markFail"
				>
					FAIL
				</button>
				<button
					v-show="showButtons"
					class="pass-button"
					:style="{ borderColor: contrastColor }"
					@click="markPass"
				>
					PASS
				</button>
				<button v-show="testStarted && showButtons" class="reset-button" @click="restartTest">
					RESET
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	import gifshot from 'gifshot' // To create the GIF animation

	export default {
		props: {
			durationInSeconds: {
				type: Number,
				default: 2, // Default duration in seconds
			},
		},
		emits: ['input', 'save:testData'],
		data() {
			return {
				testStarted: false,
				currentColor: '#000000', // Initial color (black)
				colorIndex: 0,
				colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'], // Primary colors
				interval: null,
				duration: this.durationInSeconds * 1000, // Convert seconds to milliseconds
				showButtons: false,
				gifCapturing: false,
				gifData: null,
				testStatus: {
					status: null,
					base64: null,
					ext: 'gif',
					type: 'deadpixel',
				},
			}
		},
		watch: {
			durationInSeconds(newVal) {
				this.duration = newVal * 1000 // Update duration in milliseconds
			},
		},
		computed: {
			contrastColor() {
				// Calculate contrast color for buttons
				const color = this.currentColor.replace('#', '')
				const r = parseInt(color.substring(0, 2), 16)
				const g = parseInt(color.substring(2, 4), 16)
				const b = parseInt(color.substring(4, 6), 16)
				return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff'
			},
		},
		methods: {
			startTest() {
				this.enterFullscreen()
					.then(() => {
						this.testStarted = true
						this.showButtons = false
						this.colorIndex = 0
						this.currentColor = this.colors[this.colorIndex]
						this.startGifCapture()
						this.interval = setInterval(() => {
							this.colorIndex++
							if (this.colorIndex >= this.colors.length) {
								this.stopTest()
							} else {
								this.currentColor = this.colors[this.colorIndex]
							}
						}, this.duration)
					})
					.catch((error) => {
						console.error('Error entering fullscreen:', error)
						alert('Unable to start the test. Please check fullscreen permissions.')
					})
			},
			restartTest() {
				this.resetStatus()
				clearInterval(this.interval)
				this.colorIndex = 0
				this.currentColor = this.colors[this.colorIndex]
				this.startTest()
			},
			stopTest() {
				clearInterval(this.interval)
				this.interval = null
				this.stopGifCapture()
				this.showButtons = true
				this.exitFullscreen().catch((error) => {
					console.error('Error exiting fullscreen:', error)
				})
			},
			startGifCapture() {
				this.gifCapturing = true
				gifshot.createGIF(
					{
						gifWidth: window.innerWidth,
						gifHeight: window.innerHeight,
						interval: this.duration / 1000,
						numFrames: this.colors.length,
						text: 'Dead Pixel Test',
						fontColor: 'white',
					},
					(obj) => {
						if (!obj.error) {
							this.testStatus.base64 = obj.image
							this.$emit('save:testData', this.testStatus)
						}
					},
				)
			},
			stopGifCapture() {
				this.gifCapturing = false
			},
			markFail() {
				this.testStatus.status = false
				this.$emit('input', this.testStatus)
				this.resetTest()
			},
			markPass() {
				this.testStatus.status = true
				this.$emit('input', this.testStatus)
				this.resetTest()
			},
			resetTest() {
				this.testStarted = false
				this.showButtons = false
				this.colorIndex = 0
				this.currentColor = '#000000'
			},
			resetStatus() {
				this.testStatus = {
					status: null,
					base64: null,
					ext: 'gif',
					type: 'deadpixel',
				}
			},
			async enterFullscreen() {
				if (!document.fullscreenElement) {
					document.documentElement.requestFullscreen()
					document.body.style.overflow = 'hidden'
				} else {
					document.exitFullscreen()
					document.body.style.overflow = ''
				}
			},
			async exitFullscreen() {
				if (document.exitFullscreen) {
					return document.exitFullscreen()
				} else if (document.webkitExitFullscreen) {
					return document.webkitExitFullscreen()
				} else if (document.msExitFullscreen) {
					return document.msExitFullscreen()
				} else {
					console.warn('Fullscreen API is not supported on this browser.')
					return Promise.reject('Fullscreen API not supported.')
				}
			},
		},
	}
</script>

<style scoped>
	.app-container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.fullscreen-test {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.5s ease;
		z-index: 1000;
	}
	.button-container {
		position: absolute;
		bottom: 20px;
		display: flex;
		gap: 20px;
	}

	.start-button {
		transform: translateX(-50%);
		background-color: #4caf50;
		color: white;
		border: none;
		outline: none;
		border-radius: 50%;
		width: 80px;
		height: 80px;
		font-size: 18px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
		transition: background-color 0.3s ease;
	}

	.start-button:hover {
		background-color: #45a049;
	}

	.start-button:active {
		background-color: #3e8e41;
	}

	.reset-button {
		padding: 15px 30px;
		font-size: 1.2em;
		cursor: pointer;
		border: 2px solid;
		background: none;
		color: blue;
		transition: all 0.3s;
	}
	.reset-button:hover {
		background: blue;
		color: #fff;
	}
	button {
		padding: 15px 30px;
		font-size: 1.2em;
		cursor: pointer;
		border: 2px solid;
		background: none;
		color: inherit;
	}
	.fail-button {
		color: red;
	}
	.pass-button {
		color: green;
	}
</style>
