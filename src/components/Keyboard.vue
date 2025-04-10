.notification {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background-color: #333;
	color: #fff;
	padding: 15px 20px;
	border-radius: 4px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	transition: opacity 0.3s, transform 0.3s;
	animation: slideIn 0.3s forwards;
  }
  
  @keyframes slideIn {
	from {
	  transform: translateX(100%);
	  opacity: 0;
	}
	to {
	  transform: translateX(0);
	  opacity: 1;
	}
  }.right-click-progress-container {
	position: fixed;
	top: 10px;
	left: 0;
	right: 0;
	height: 20px;
	background-color: #eee;
	border-radius: 10px;
	margin: 0 20px;
	overflow: hidden;
	z-index: 100;
  }
  
  .right-click-progress {
	height: 100%;
	background-color: #4CAF50;
	transition: width 0.05s linear;
  }
  
  .right-click-text {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #000;
	font-size: 12px;
	font-weight: bold;
  }
  
  .capture-status {
	font-size: 14px;
	font-weight: normal;
	color: #666;
	margin-left: 10px;
  }
  
  .toggle_kb_btn {
	padding: 10px 20px;
	background-color: #f4f4f4;
	border: 1px solid #ccc;
	color: #000000;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s ease;
  }
  
  .toggle_kb_btn:hover {
	background-color: #e0e0e0;
  }
  
  .scale-control {
	display: flex;
	align-items: center;
	margin-bottom: 15px;
	justify-content: center;
	gap: 10px;
	background-color: #f4f4f4;
	padding: 10px;
	border-radius: 5px;
  }
  
  .slider {
	-webkit-appearance: none;
	width: 200px;
	height: 10px;
	border-radius: 5px;
	background: #d3d3d3;
	outline: none;
  }
  
  .slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: #4CAF50;
	cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: #4CAF50;
	cursor: pointer;
  }
  
  .pressed-keys-container {
	margin-top: 20px;
	width: 100%;
	background-color: #f9f9f9;
	border: 1px solid #ddd;
	border-radius: 5px;
	padding: 10px;
	max-height: 200px;
	overflow-y: auto;
  }
  
  .pressed-keys-list {
	display: flex;
	flex-direction: column;
  }
  
  .pressed-key-item {
	display: flex;
	padding: 5px;
	border-bottom: 1px solid #eee;
  }
  
  .pressed-key-item:last-child {
	border-bottom: none;
  }
  
  .key-name {
	flex: 0 0 100px;
	font-weight: bold;
  }
  
  .key-code {
	flex: 0 0 150px;
	color: #666;
  }
  
  .timestamp {
	flex: 1;
	text-align: right;
	color: #999;
  }
  
  .clear_kb_btn {
	padding: 10px 20px;
	background-color: #f4f4f4;
	border: 1px solid #ccc;
	color: #000000;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s ease;
  }
  
  .clear_kb_btn:hover {
	background-color: #e0e0e0;
  }    startRightClickTimer() {
		// Limpiamos cualquier timer existente
		this.clearRightClickTimer()
		
		// Reiniciamos el progreso
		this.rightClickProgress = 5
		
		// Establecemos un intervalo que incrementa el progreso cada 50ms
		this.rightClickTimer = setInterval(() => {
		  this.rightClickProgress += 1
		  
		  // Si llegamos al 100% (5 segundos)
		  if (this.rightClickProgress >= 100) {
			this.toggleCapture()
			this.clearRightClickTimer()
			
			// Mostrar notificación q.notify
			this.showNotification = true
			this.notificationMessage = `¡Captura de teclado ${this.captureActive ? 'activada' : 'desactivada'}!`
			
			// Ocultar la notificación después de 3 segundos
			if (this.notificationTimer) clearTimeout(this.notificationTimer)
			this.notificationTimer = setTimeout(() => {
			  this.showNotification = false
			}, 3000)
		  }
		}, 50) // 50ms * 100 = 5000ms (5 segundos)
	  },
	  
	  clearRightClickTimer() {
		if (this.rightClickTimer) {
		  clearInterval(this.rightClickTimer)
		  this.rightClickTimer = null
		  this.rightClickProgress = 0
		}
	  },
	  
	  toggleCapture() {
		this.captureActive = !this.captureActive
		
		// Mostrar notificación
		this.showNotification = true
		this.notificationMessage = `¡Captura de teclado ${this.captureActive ? 'activada' : 'desactivada'}!`
		
		// Ocultar la notificación después de 3 segundos
		if (this.notificationTimer) clearTimeout(this.notificationTimer)
		this.notificationTimer = setTimeout(() => {
		  this.showNotification = false
		}, 3000)
	  },
	  
	  clearPressedKeys() {
		this.pressedKeysList = []
	  },<template>
	<div 
	  id="kb_box" 
	  style="min-height: 200px" 
	  :style="{ transform: `scale(${scale})` }"
	  @contextmenu.prevent="startRightClickTimer"
	  @mouseup="clearRightClickTimer"
	  @mouseleave="clearRightClickTimer"
	>
	  <div v-if="showStartModal" class="start-modal">
		<button class="start-button" @click="startCapture">Start</button>
	  </div>
	  <div v-else>
		<div v-if="rightClickProgress > 0" class="right-click-progress-container">
		  <div class="right-click-progress" :style="{ width: `${rightClickProgress}%` }"></div>
		  <div class="right-click-text">Mantenga presionado para desactivar ({{ Math.ceil(5 - (rightClickProgress / 20)) }}s)</div>
		</div>
		
		<div class="scale-control">
		  <label for="scale-slider">Tamaño del teclado:</label>
		  <input 
			type="range" 
			id="scale-slider" 
			v-model="scale" 
			min="0.5" 
			max="1.5" 
			step="0.1" 
			class="slider"
		  />
		  <span>{{ Math.round(scale * 100) }}%</span>
		</div>
		
		<div class="keyboard-container">
		  <div id="kb_box_l">
			<div v-for="row in keyRows" :key="row.id" class="kb_row">
			  <div
				v-for="key in row.keys"
				:key="key.id"
				:class="['kb_btn', key.size, key.class]"
				:id="key.id"
				:style="{ backgroundColor: key.pressed ? this.activeColors[this.currentColorIndex] : '#f4f4f4', color: '#000000' }"
				@click="pressKey(key.id)"
			  >
				<span v-html="key.label"></span>
			  </div>
			</div>
		  </div>
		  
		  <div class="pressed-keys-container">
			<h3>Teclas Presionadas: <span class="capture-status">{{ captureActive ? '(Captura activa)' : '(Captura pausada)' }}</span></h3>
			<div class="pressed-keys-list">
			  <div v-for="(keyInfo, index) in pressedKeysList" :key="index" class="pressed-key-item">
				<span class="key-name">{{ keyInfo.key }}</span>
				<span class="key-code">{{ keyInfo.code }}</span>
				<span class="timestamp">{{ keyInfo.timestamp }}</span>
			  </div>
			</div>
		  </div>
		  
		  <div id="kb_box_b">
			<input type="button" @click="resetKeyboard" value="Reset" class="reset_kb_btn" />
			<input type="button" @click="toggleCapture" :value="captureActive ? 'Pausar Captura' : 'Reanudar Captura'" class="toggle_kb_btn" />
			<input type="button" @click="clearPressedKeys" value="Limpiar Registro" class="clear_kb_btn" />
			<input type="button" @click="stopCapture" value="Stop" class="stop_kb_btn" />
		  </div>
		</div>
		
		<!-- Notificación temporal -->
		<div v-if="showNotification" class="notification">
		  {{ notificationMessage }}
		</div>
	  </div>
	</div>
  </template>
  
  <script>
  export default {
	data() {
	  return {
		keyRows: [
		  // Function Keys Row
		  {
			id: 1,
			keys: [
			  { id: 'kb_btn_Escape', label: 'Esc', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_blank1', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_F1', label: 'F1', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F2', label: 'F2', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F3', label: 'F3', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F4', label: 'F4', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_blank2', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_F5', label: 'F5', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F6', label: 'F6', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F7', label: 'F7', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F8', label: 'F8', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F9', label: 'F9', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F10', label: 'F10', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F11', label: 'F11', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_F12', label: 'F12', size: 'kb_btn_small', pressed: false, class: 'function' },
			  { id: 'kb_btn_blank3', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_PrintScreen', label: 'PrtSc', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_ScrollLock', label: 'ScrLk', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Pause', label: 'Pause', size: 'kb_btn_small', pressed: false },
			],
		  },
		  // Number Row
		  {
			id: 2,
			keys: [
			  { id: 'kb_btn_Backquote', label: '~<br>`', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit1', label: '!<br>1', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit2', label: '@<br>2', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit3', label: '#<br>3', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit4', label: '$<br>4', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit5', label: '%<br>5', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit6', label: '^<br>6', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit7', label: '&<br>7', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit8', label: '*<br>8', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit9', label: '(<br>9', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Digit0', label: ')<br>0', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Minus', label: '_<br>-', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Equal', label: '+<br>=', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Backspace', label: 'Backspace', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_blank4', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_Insert', label: 'Insert', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Home', label: 'Home', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_PageUp', label: 'Page<br>Up', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_NumLock', label: 'Num Lock', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumDivide', label: '/', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumMultiply', label: '*', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumMinus', label: '-', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			],
		  },
		  // QWERTY Row
		  {
			id: 3,
			keys: [
			  { id: 'kb_btn_Tab', label: 'Tab', size: 'kb_btn_medium', pressed: false },
			  { id: 'kb_btn_KeyQ', label: 'Q', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyW', label: 'W', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyE', label: 'E', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyR', label: 'R', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyT', label: 'T', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyY', label: 'Y', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyU', label: 'U', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyI', label: 'I', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyO', label: 'O', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyP', label: 'P', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_BracketLeft', label: '{<br>[', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_BracketRight', label: '}<br>]', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Backslash', label: '|<br>\\', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_blank5', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_Delete', label: 'Del', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_End', label: 'End', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_PageDown', label: 'Page<br>Down', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Num7', label: '7', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num8', label: '8', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num9', label: '9', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumPlus', label: '+', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			],
		  },
		  // Home Row
		  {
			id: 4,
			keys: [
			  { id: 'kb_btn_CapsLock', label: 'Caps Lock', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_KeyA', label: 'A', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyS', label: 'S', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyD', label: 'D', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyF', label: 'F', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyG', label: 'G', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyH', label: 'H', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyJ', label: 'J', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyK', label: 'K', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyL', label: 'L', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Semicolon', label: ':<br>;', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Quote', label: '"<br>\'', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Enter', label: 'Enter', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_blank6', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_blank7', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_blank8', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_blank9', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_Num4', label: '4', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num5', label: '5', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num6', label: '6', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumPlus2', label: '+', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			],
		  },
		  // Bottom Row
		  {
			id: 5,
			keys: [
			  { id: 'kb_btn_ShiftLeft', label: 'Shift', size: 'kb_btn_xlarge', pressed: false },
			  { id: 'kb_btn_KeyZ', label: 'Z', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyX', label: 'X', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyC', label: 'C', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyV', label: 'V', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyB', label: 'B', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyN', label: 'N', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_KeyM', label: 'M', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Comma', label: '&lt;<br>,', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Period', label: '&gt;<br>.', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_Slash', label: '?<br>/', size: 'kb_btn_small', pressed: false },
			  { id: 'kb_btn_ShiftRight', label: 'Shift', size: 'kb_btn_xlarge', pressed: false },
			  { id: 'kb_btn_blank10', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_ArrowUp', label: '↑', size: 'kb_btn_arrow', pressed: false },
			  { id: 'kb_btn_blank11', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_blank12', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_Num1', label: '1', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num2', label: '2', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_Num3', label: '3', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumEnter', label: 'Enter', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			],
		  },
		  // Space Row
		  {
			id: 6,
			keys: [
			  { id: 'kb_btn_ControlLeft', label: 'Ctrl', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_MetaLeft', label: 'Win', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_AltLeft', label: 'Alt', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_Space', label: 'Space', size: 'kb_btn_space', pressed: false },
			  { id: 'kb_btn_AltRight', label: 'Alt', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_MetaRight', label: 'Win', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_ContextMenu', label: 'Menu', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_ControlRight', label: 'Ctrl', size: 'kb_btn_large', pressed: false },
			  { id: 'kb_btn_ArrowLeft', label: '←', size: 'kb_btn_arrow', pressed: false },
			  { id: 'kb_btn_ArrowDown', label: '↓', size: 'kb_btn_arrow', pressed: false },
			  { id: 'kb_btn_ArrowRight', label: '→', size: 'kb_btn_arrow', pressed: false },
			  { id: 'kb_btn_blank13', label: '', size: 'kb_btn_small', pressed: false, class: 'blank' },
			  { id: 'kb_btn_Num0', label: '0', size: 'kb_btn_medium', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumDecimal', label: '.', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			  { id: 'kb_btn_NumEnter2', label: 'Enter', size: 'kb_btn_small', pressed: false, class: 'num-key' },
			],
		  },
		],
		showStartModal: true,
		keydownSet: {},
		toggleColor: false,
		// Colores que alternarán
		activeColors: ['#FF8C00', '#4CAF50'], // Naranja y Verde
		currentColorIndex: 0,
		// Lista de teclas presionadas
		pressedKeysList: [],
		// Control de escala
		scale: 1.0,
		// Control para el clic derecho
		rightClickTimer: null,
		rightClickProgress: 0,
		captureActive: true,
		// Notificación
		showNotification: false,
		notificationMessage: '',
		notificationTimer: null
	  }
	},
	methods: {
	  pressKey(keyId) {
		// No hacemos nada al hacer clic en una tecla
		// La función permanece para mantener la compatibilidad con la estructura existente
		return
	  },
	  resetKeyboard() {
		this.keyRows.forEach((row) => row.keys.forEach((key) => (key.pressed = false)))
		this.$emit('allKeysPressed', false)
	  },
	  checkAllKeysPressed() {
		const allPressed = this.keyRows.every((row) => row.keys.every((key) => key.pressed))
		this.$emit('allKeysPressed', allPressed)
	  },
	  handleKeydown(event) {
		event = event || window.event
		const key = event.keyCode
		if (this.keydownSet[key]) return
		this.keydownSet[key] = true
		event.preventDefault()
		let keyId = `kb_btn_${event.code}`
		
		// Handle special cases
		if (event.code === 'ContextMenu') {
		  keyId = 'kb_btn_ContextMenu'
		}
		
		const row = this.keyRows.find((row) => row.keys.some((key) => key.id === keyId))
		const keyObj = row ? row.keys.find((k) => k.id === keyId) : null
		
		if (keyObj) {
		  // Cambiar el índice de color cada vez que se presiona una tecla
		  this.currentColorIndex = (this.currentColorIndex + 1) % this.activeColors.length
		  keyObj.pressed = true
		  this.checkAllKeysPressed()
		  
		  // Registrar la tecla presionada solo si la captura está activa
		  if (this.captureActive) {
			const now = new Date()
			const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
			
			this.pressedKeysList.push({
			  key: keyObj.label.replace(/<br>/g, ' '),
			  code: event.code,
			  timestamp: timestamp
			})
		  }
		}
	  },
	  handleKeyup(event) {
		event = event || window.event
		const key = event.keyCode
		if (this.keydownSet[key]) {
		  delete this.keydownSet[key]
		}
		
		// Desactivar la tecla al soltar
		let keyId = `kb_btn_${event.code}`
		
		// Handle special cases
		if (event.code === 'ContextMenu') {
		  keyId = 'kb_btn_ContextMenu'
		}
		
		const row = this.keyRows.find((row) => row.keys.some((key) => key.id === keyId))
		const keyObj = row ? row.keys.find((k) => k.id === keyId) : null
		
		if (keyObj) {
		  keyObj.pressed = false
		  this.checkAllKeysPressed()
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
		event.preventDefault()
	  },
	  enableDefaultKeys() {
		document.removeEventListener('keydown', this.disableDefaultKeys, { capture: true })
	  },
	  startCapture() {
		this.showStartModal = false
		document.addEventListener('keydown', this.disableDefaultKeys, { capture: true })
		this.addKeyboardListeners()
		this.pressedKeysList = []
		this.captureActive = true
	  },
	  stopCapture() {
		this.showStartModal = true
		this.removeKeyboardListeners()
		this.enableDefaultKeys()
	  },
	},
	created() {
	  this.handleKeydownBound = this.handleKeydown.bind(this)
	  this.handleKeyupBound = this.handleKeyup.bind(this)
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
	background-color: #ffffff;
	border-radius: 10px;
	padding: 20px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	border: 2px solid #ccc;
	user-select: none;
	transform-origin: top center; /* Asegura que la escala se aplique desde el centro superior */
  }
  
  .keyboard-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	min-height: 400px; /* Altura mínima para que sea visible */
  }
  
  #kb_box_l {
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: 70vh;
	overflow-y: auto;
  }
  
  .kb_row {
	display: flex;
	justify-content: center;
	width: 100%;
	margin-bottom: 5px;
	gap: 5px;
  }
  
  .kb_btn {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	margin: 0;
	padding: 5px;
	border: 1px solid #ccc;
	color: #000000;
	box-sizing: border-box;
	text-align: center;
	border-radius: 5px;
	transition: background-color 0.3s ease;
	cursor: pointer;
	height: 40px;
  }
  
  .kb_btn_small {
	flex: 1 1 5%;
  }
  
  .kb_btn_medium {
	flex: 1 1 8%;
  }
  
  .kb_btn_large {
	flex: 1 1 10%;
  }
  
  .kb_btn_xlarge {
	flex: 1 1 12%;
  }
  
  .kb_btn_space {
	flex: 1 1 30%;
  }
  
  .kb_btn_arrow {
	flex: 1 1 5%;
	font-size: 1.5rem;
  }
  
  .function {
	background-color: #e0e0e0 !important;
  }
  
  .blank {
	visibility: hidden;
  }
  
  .num-key {
	background-color: #e0e0e0 !important;
  }
  
  #kb_box_b {
	display: flex;
	justify-content: center;
	gap: 20px;
	margin-top: 20px;
  }
  
  .reset_kb_btn,
  .stop_kb_btn {
	padding: 10px 20px;
	background-color: #f4f4f4;
	border: 1px solid #ccc;
	color: #000000;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s ease;
  }
  
  .reset_kb_btn:hover,
  .stop_kb_btn:hover {
	background-color: #e0e0e0;
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
	background: rgba(255, 255, 255, 0.8);
	z-index: 10;
  }
  
  .start-button {
	background-color: #f4f4f4;
	border: 2px solid #ccc;
	border-radius: 50%;
	width: 100px;
	height: 100px;
	font-size: 20px;
	color: #000000;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: auto;
	transition: background-color 0.3s ease;
  }
  
  .start-button:hover {
	background-color: #e0e0e0;
  }
  </style>