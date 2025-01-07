<template>
	<div id="kb_box" style="min-height: 200px">
		<div v-if="showStartModal" class="start-modal column justify-center items-center">
			<button class="start-button" @click="startCapture">Start</button>
			<div v-if="allKeysPressedMessage" class="success-message q-mt-md text-center">
				{{ allKeysPressedMessage }}
			</div>
		</div>
		<div v-else>
			<div id="kb_box_l">
				<div v-for="row in keyRows" :key="row.id" class="kb_row">
					<div
						v-for="key in row.keys"
						:key="key.id"
						:class="['kb_btn', key.size, key.class]"
						:id="key.id"
						:style="{ backgroundColor: key.color }"
						@click="pressKey(key.id)"
					>
						<span v-html="key.label"></span>
					</div>
				</div>
			</div>
			<div id="kb_box_b" class="row justify-between q-pt-md">
				<q-btn color="red" icon="close" label="Fail" @click="captureKeyboard('fail')" />
				<q-btn color="primary" label="Reset" @click="resetKeyboard" />
				<q-btn color="green" icon="check" label="Pass" @click="captureKeyboard('pass')" />
			</div>
		</div>
	</div>
</template>

<script>
	import html2canvas from 'html2canvas'
	export default {
		props: {
			value: {
				type: Object,
				default: {}, // Inicialmente no completado
			},
		},
		data() {
			return {
				keyRows: [
					{
						id: 1,
						keys: [
							{
								id: 'kb_btn_Escape',
								label: 'Esc',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F1',
								label: 'F1',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F2',
								label: 'F2',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F3',
								label: 'F3',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F4',
								label: 'F4',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F5',
								label: 'F5',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F6',
								label: 'F6',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F7',
								label: 'F7',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F8',
								label: 'F8',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F9',
								label: 'F9',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F10',
								label: 'F10',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F11',
								label: 'F11',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_F12',
								label: 'F12',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 2,
						keys: [
							{
								id: 'kb_btn_Backquote',
								label: '~<br>`',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit1',
								label: '!<br>1',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit2',
								label: '@<br>2',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit3',
								label: '#<br>3',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit4',
								label: '$<br>4',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit5',
								label: '%<br>5',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit6',
								label: '^<br>6',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit7',
								label: '&<br>7',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit8',
								label: '*<br>8',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit9',
								label: '(<br>9',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Digit0',
								label: ')<br>0',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Minus',
								label: '_<br>-',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Equal',
								label: '+<br>=',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Backspace',
								label: 'Backspace',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 3,
						keys: [
							{
								id: 'kb_btn_Tab',
								label: 'Tab',
								size: 'kb_btn_medium',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyQ',
								label: 'Q',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyW',
								label: 'W',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyE',
								label: 'E',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyR',
								label: 'R',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyT',
								label: 'T',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyY',
								label: 'Y',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyU',
								label: 'U',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyI',
								label: 'I',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyO',
								label: 'O',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyP',
								label: 'P',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_BracketLeft',
								label: '{<br>[',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_BracketRight',
								label: '}<br>]',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Backslash',
								label: '|<br>\\',
								size: 'kb_btn_medium',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 4,
						keys: [
							{
								id: 'kb_btn_CapsLock',
								label: 'Caps<br>Lock',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyA',
								label: 'A',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyS',
								label: 'S',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyD',
								label: 'D',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyF',
								label: 'F',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyG',
								label: 'G',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyH',
								label: 'H',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyJ',
								label: 'J',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyK',
								label: 'K',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyL',
								label: 'L',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Semicolon',
								label: ':<br>;',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Quote',
								label: '"<br>\'',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Enter',
								label: 'Enter',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 5,
						keys: [
							{
								id: 'kb_btn_ShiftLeft',
								label: 'Shift',
								size: 'kb_btn_xlarge',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyZ',
								label: 'Z',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyX',
								label: 'X',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyC',
								label: 'C',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyV',
								label: 'V',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyB',
								label: 'B',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyN',
								label: 'N',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_KeyM',
								label: 'M',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Comma',
								label: '&lt;<br>,',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Period',
								label: '&gt;<br>.',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Slash',
								label: '?<br>/',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ShiftRight',
								label: 'Shift',
								size: 'kb_btn_xlarge',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 6,
						keys: [
							{
								id: 'kb_btn_ControlLeft',
								label: 'Ctrl',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_MetaLeft',
								label: 'Win',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_AltLeft',
								label: 'Alt',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_FnLeft',
								label: 'Fn',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_Space',
								label: 'Space',
								size: 'kb_btn_space',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_FnRight',
								label: 'Fn',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_AltRight',
								label: 'Alt',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_MetaRight',
								label: 'Win',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ContextMenu',
								label: 'Menu',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ControlRight',
								label: 'Ctrl',
								size: 'kb_btn_large',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
					{
						id: 7,
						keys: [
							{
								id: 'kb_btn_ArrowUp',
								label: '↑',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ArrowLeft',
								label: '←',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ArrowDown',
								label: '↓',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
							{
								id: 'kb_btn_ArrowRight',
								label: '→',
								size: 'kb_btn_small',
								color: 'rgba(255, 255, 255, 0.1)',
								pressed: false,
							},
						],
					},
				],
				showStartModal: true,
				keydownSet: {},
				allKeysPressedMessage: '',
			}
		},
		methods: {
			toggleKeyColor(key) {
				const newColor = key.color === '#00FF00' ? '#FF0000' : '#00FF00'
				this.$set(key, 'color', newColor)
				this.saveStateToLocalStorage() // Save state after color change
			},
			pressKey(keyId) {
				const row = this.keyRows.find((row) => row.keys.some((key) => key.id === keyId))
				const key = row ? row.keys.find((k) => k.id === keyId) : null
				if (key) {
					if (!key.pressed) {
						key.pressed = true
						this.checkAllKeysPressed()
					}
					this.toggleKeyColor(key)
				}
			},
			resetKeyboard() {
				this.keyRows.forEach((row) => {
					row.keys.forEach((key) => {
						this.$set(key, 'color', 'rgba(255, 255, 255, 0.1)')
						key.pressed = false
					})
				})
				this.allKeysPressedMessage = ''
				this.showStartModal = true
				localStorage.removeItem('keyboardTestState')
				this.saveStateToLocalStorage()
			},
			checkAllKeysPressed() {
				const allPressed = this.keyRows.every((row) => row.keys.every((key) => key.pressed))
				if (allPressed) {
					this.captureKeyboard('pass')
				}
			},

			captureKeyboard(status) {
				const element = document.getElementById('kb_box')
				if (element) {
					html2canvas(element).then((canvas) => {
						const base64Image = canvas.toDataURL('image/png')
						const imageData = {
							ext: 'png',
							type: 'keyboard',
							base64: base64Image,
						}
						const message = status === 'pass' ? 'Keyboard test PASS' : 'Keyboard test FAIL'
						const result = {
							status: status === 'pass',
							image: imageData,
							message: message,
						}

						// Guardar en localStorage
						localStorage.setItem('keyboardTestState', JSON.stringify(result))

						// Emitir al componente padre
						this.$emit('input', result)

						this.resetKeyboard()
						this.showStartModal = true
						this.allKeysPressedMessage = result.message
					})
				}
			},

			handleKeydown(event) {
				if (event.ctrlKey && event.code === 'Escape') {
					this.captureKeyboard('fail')
					return
				}
				event = event || window.event
				const key = event.keyCode
				if (this.keydownSet[key]) return
				this.keydownSet[key] = true
				event.preventDefault()

				let keyId = `kb_btn_${event.code}`
				if (event.code === 'Fn') {
					keyId = event.location === 1 ? 'kb_btn_FnLeft' : 'kb_btn_FnRight'
				} else if (event.code === 'ContextMenu') {
					keyId = 'kb_btn_ContextMenu'
				}
				this.pressKey(keyId)
			},

			handleKeyup(event) {
				event = event || window.event
				const key = event.keyCode
				if (this.keydownSet[key]) {
					delete this.keydownSet[key]
				}
			},

			addKeyboardListeners() {
				window.addEventListener('keydown', this.handleKeydownBound, { capture: true })
				window.addEventListener('keyup', this.handleKeyupBound, { capture: true })
			},

			removeKeyboardListeners() {
				window.removeEventListener('keydown', this.handleKeydownBound, { capture: true })
				window.removeEventListener('keyup', this.handleKeyupBound, { capture: true })
			},

			disableDefaultKeys(event) {
				if (event.ctrlKey && event.code === 'Escape') {
					return
				}
			},

			enableDefaultKeys() {
				document.removeEventListener('keydown', this.disableDefaultKeys, { capture: true })
			},

			startCapture() {
				this.showStartModal = false
				document.addEventListener('keydown', this.disableDefaultKeys, { capture: true })
				this.addKeyboardListeners()
				this.allKeysPressedMessage = ''
			},
			saveStateToLocalStorage() {
				const state = {
					keyRows: this.keyRows,
					allKeysPressedMessage: this.allKeysPressedMessage,
					showStartModal: this.showStartModal,
				}

				// Comparar con el estado actual en localStorage
				const savedState = localStorage.getItem('keyboardTestState')
				if (savedState) {
					const currentState = JSON.stringify(state)
					if (currentState === savedState) {
						// No guardar si el estado ya es igual
						return
					}
				}

				// Guardar nuevo estado
				localStorage.setItem('keyboardTestState', JSON.stringify(state))
			},
			loadStateFromLocalStorage() {
				const savedState = localStorage.getItem('keyboardTestState')
				if (savedState) {
					const { keyRows, allKeysPressedMessage, showStartModal } = JSON.parse(savedState)
					this.keyRows = keyRows
					this.allKeysPressedMessage = allKeysPressedMessage
					this.showStartModal = showStartModal
				}
			},
		},

		created() {
			this.handleKeydownBound = this.handleKeydown.bind(this)
			this.handleKeyupBound = this.handleKeyup.bind(this)
			this.loadStateFromLocalStorage() // Carga el estado al iniciar el componente
		},

		beforeDestroy() {
			this.removeKeyboardListeners()
			this.enableDefaultKeys()
		},
	}
</script>

<style scoped>
	#kb_box {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 200px;
		backdrop-filter: blur(10px);
		background: rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.3);
		user-select: none; /* Prevent text selection */
	}

	.kb_row {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.kb_btn {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1rem;
		margin: 3px;
		padding: 5px;
		border: 1px solid #ccc;
		color: #f0f8ff;
		box-sizing: border-box;
		text-align: center;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}

	.kb_btn_small {
		flex: 1 1 5%;
	}
	.success-message {
		margin-top: 10px;
		font-size: 1.2rem;
		color: #00ff00;
		text-align: center;
	}
	.start-modal {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		backdrop-filter: blur(10px);
		background: rgba(0, 0, 0, 0.5);
	}
	.start-modal {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		backdrop-filter: blur(10px);
		background: rgba(0, 0, 0, 0.5);
	}

	.start-button {
		background-color: #00ff00;
		border: none;
		border-radius: 50%;
		width: 100px;
		height: 100px;
		font-size: 20px;
		color: white;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: auto; /* Center button */
		transition: border 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
		outline: none; /* Eliminar borde cuadrado */
	}

	.start-button:hover {
		border: 2px solid red; /* Borde rojo al pasar el mouse */
	}

	.start-button:active {
		box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.5); /* Efecto de empuje */
		transform: scale(0.95); /* Escala más pequeña */
	}
</style>
