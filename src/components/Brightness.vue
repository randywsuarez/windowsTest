<template>
	<q-page class="flex flex-center">
		<div class="test-screen" ref="testScreen">
			<q-slider
				v-model="brightness"
				:min="15"
				:max="100"
				:step="1"
				color="blue"
				label
				class="custom-slider q-pt-lg"
				@input="updateBrightness"
			/>
			<div class="status-message">{{ status }}</div>
			<div id="kb_box_b" class="row justify-between q-pt-md">
				<q-btn color="red" icon="close" label="Fail" @click="handleFail" />
				<q-btn color="primary" label="Start" @click="handleStart" />
				<q-btn color="green" icon="check" label="Pass" @click="handlePass" />
			</div>
		</div>
	</q-page>
</template>

<script>
	import { spawn } from 'child_process'
	import html2canvas from 'html2canvas'

	export default {
		props: {
			value: {
				type: Object,
				default: () => ({}),
			},
		},
		data() {
			return {
				brightness: 100, // Nivel inicial de brillo
				status: 'Initializing brightness...',
				powerShellProcess: null, // Proceso persistente de PowerShell
				intervalId: null, // ID del intervalo para el ajuste automático
			}
		},
		mounted() {
			this.startPowerShellProcess()
		},
		beforeDestroy() {
			if (this.powerShellProcess) {
				this.powerShellProcess.stdin.end()
				this.powerShellProcess.kill()
			}
			if (this.intervalId) {
				clearInterval(this.intervalId)
			}
		},
		methods: {
			async generateJson(status) {
				const message = `Brightness test ${status ? 'PASS' : 'FAIL'}`
				const base64 = await this.captureDiv()
				const jsonData = {
					status,
					message,
					base64,
					ext: 'png',
					type: 'brightness',
				}
				this.$emit('input', jsonData)
			},
			async captureDiv() {
				const testScreen = this.$refs.testScreen
				const canvas = await html2canvas(testScreen)
				return canvas.toDataURL('image/png') // Convertir a base64
			},
			startPowerShellProcess() {
				this.powerShellProcess = spawn('powershell.exe', ['-Command', '-'], {
					stdio: ['pipe', 'pipe', 'pipe'],
				})

				this.powerShellProcess.on('error', (error) => {
					console.error('PowerShell process error:', error)
					this.status = 'Error initializing PowerShell.'
				})

				this.powerShellProcess.on('exit', (code, signal) => {
					console.log(`PowerShell process exited with code ${code}, signal ${signal}`)
				})

				this.powerShellProcess.stderr.on('data', (data) => {
					console.error(`PowerShell stderr: ${data}`)
				})

				this.updateBrightness()
			},
			updateBrightness() {
				const brightnessValue = this.brightness

				if (this.powerShellProcess && this.powerShellProcess.stdin.writable) {
					const powerShellCommand = `
          $brightnessMethods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods;
          $brightnessMethods.WmiSetBrightness(1, ${brightnessValue});
        `
					this.powerShellProcess.stdin.write(`${powerShellCommand}\n`)
					this.status = `Brightness set to ${brightnessValue}%.`
				} else {
					console.error('PowerShell process not writable.')
					this.status = 'Failed to adjust brightness.'
				}
			},
			handleFail() {
				this.status = 'Test failed.'
				this.generateJson(false) // Emitir el JSON con status FAIL
			},
			handlePass() {
				this.status = 'Test passed.'
				this.generateJson(true) // Emitir el JSON con status PASS
			},
			handleStart() {
				if (this.intervalId) {
					clearInterval(this.intervalId)
				}

				let brightness = 1
				let increasing = true

				this.intervalId = setInterval(() => {
					this.brightness = brightness
					this.updateBrightness()

					if (increasing) {
						brightness++
						if (brightness > 50) {
							increasing = false
						}
					} else {
						brightness++
						if (brightness >= 100) {
							clearInterval(this.intervalId)
							this.intervalId = null
						}
					}
				}, 100) // Ajuste cada 100 ms
			},
		},
	}
</script>

<style>
	.q-page {
		min-height: auto !important; /* Elimina el min-height dinámico */
		height: auto !important; /* Asegura que la altura sea controlada */
	}

	.test-screen {
		width: 100%;
		max-width: 800px; /* Ancho máximo del contenedor */
		flex-direction: column;
		align-items: center; /* Centrar contenido horizontalmente */
		padding: 0;
		min-height: 0 !important; /* Asegura que no se aplique ningún min-height adicional */
	}

	.custom-slider {
		width: 80%; /* El slider ocupa el 80% del ancho del contenedor */
	}

	.custom-slider .q-slider__track {
		height: 36px !important; /* Grosor del track */
	}

	.custom-slider .q-slider__thumb {
		width: 80px !important; /* Tamaño del botón */
		height: 80px !important;
	}

	.status-message {
		margin-top: 10px;
		font-size: 16px;
		color: #666;
	}
</style>
