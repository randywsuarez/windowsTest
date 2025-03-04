<template>
<div id="kb_box" style="min-height: 200px">
	<div v-if="showStartModal" class="start-modal column justify-center items-center">
		<button class="start-button" @click="startCapture">Start</button>
		<div v-if="allKeysPressedMessage" class="success-message q-mt-md text-center">
			{{ allKeysPressedMessage }}
		</div>
	</div>
	<div v-else>
		<div class="keyboard-wrapper">
			<!-- Conmutador: Compact / Complete -->
			<div class="switch-container row justify-center items-center q-my-md q-px-md">
				<span class="q-mr-sm text-white">Complete</span>
				<div @keydown.space.prevent>
					<q-toggle 
						:value="isCompact"
						@input="toggleKeyboard"
						@click.native="blurAfterToggle"
						color="primary" 
						size="lg"
						icon="keyboard"
						tabindex="-1"
						@click="blurAfterToggle"
						ref="keyboardToggle"
					/>
				</div>
				<span class="q-ml-sm text-white">Compact</span>
			</div>

			<!-- Teclado compacto -->
			<div v-if="isCompact" id="compact-keyboard" class="keyboard-container compact-keyboard-container">
				<div v-for="(row, rowIndex) in compactKeyboardData.rows" :key="'compact-row-' + rowIndex" class="row compact-row">
					<template v-for="(key, keyIndex) in row.keys">
						<div
							v-if="key.type === 'split-column'"
							:key="'split-col-' + keyIndex"
							class="split-column"
						>
							<div
								v-for="(splitKey, sIndex) in key.keys"
								:key="'split-key-' + sIndex"
								class="split-key"
								:id="splitKey.id"
								:style="{ backgroundColor: getKeyColor(splitKey.id) }"
								v-html="splitKey.label"
								@mousedown.prevent="pressKey(splitKey.id)"
							></div>
						</div>

						<div
							v-else
							:key="'compact-key-' + keyIndex"
							class="key"
							:id="key.id"
							:class="getKeyClasses(key)"
							:style="[getKeyStyles(key), { backgroundColor: getKeyColor(key.id) }]"
							v-html="key.label"
							@mousedown.prevent="pressKey(key.id)"
						></div>
					</template>
				</div>
			</div>

			<!-- Teclado completo -->
			<div v-else id="complete-keyboard" class="keyboard-container">
				<div v-for="(row, rowIndex) in completeKeyboardData.rows" :key="'complete-row-' + rowIndex" class="row complete-row">
					<div
						v-for="(key, keyIndex) in row.keys"
						:key="'complete-key-' + keyIndex"
						class="key"
						:id="key.id"
						:class="{ 'numpad-enter': key.id === 'kb_btn_NumpadEnter', 'blank': key.class && key.class.includes('blank'), 'no-pointer-events': true }"
						:style="[getKeyStyles(key), { backgroundColor: getKeyColor(key.id) }]"
						v-html="key.label"
					></div>
				</div>
			</div>
			
			<!-- Controles -->
			<div id="kb_box_b" class="row justify-center q-pt-md q-mt-md q-gutter-md">
			<q-btn 
				color="negative" 
				icon="close" 
				label="Fail" 
				@click="captureKeyboard('fail')" 
				class="col-3"
				tabindex="-1" 
			/>
			<q-btn 
				color="primary" 
				icon="refresh" 
				label="Reset" 
				@click="resetKeyboard" 
				class="col-3"
				tabindex="-1" 
			/>
			<q-btn
				color="positive"
				icon="check"
				label="Pass"
				@click="captureKeyboard('pass')"
				:disable="!allKeysPressed"
				class="col-3"
				tabindex="-1"
			/>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import html2canvas from 'html2canvas';

// Usar una función pura para facilitar la limpieza
const preventToggleSpaceActivation = (event) => {
	if (event.code === 'Space' || event.keyCode === 32) {
		const toggleElement = document.querySelector('.q-toggle');
		if (toggleElement && (document.activeElement === toggleElement || document.activeElement.closest('.q-toggle'))) {
			event.preventDefault();
			event.stopPropagation();
			document.activeElement.blur();
			return false;
		}
	}
};

export default {
	data() {
		return {
			isCompact: false, // Iniciar con el teclado completo
			compactKeyboardData: { rows: [] },
			completeKeyboardData: { rows: [] }, 
			showStartModal: true,
			allKeysPressedMessage: '',
			noTest: [], // Teclas excluidas del test
			keyState: {}, // Almacena el estado de cada tecla: { id: { pressed: boolean, color: string } }
			keydownSet: {}, // Para evitar repetición de eventos keydown
			allKeysPressed: false, // Indica si todas las teclas requeridas se han presionado
			wrongKeys: new Set() // Registro de teclas erróneas
		};
	},
	methods: {
		// Aplica estilos dinámicamente a cada tecla
		getKeyStyles(key) {
			return {
				'grid-column': `span ${key.span || 1}`,
				'grid-row': key.rowSpan ? `span ${key.rowSpan}` : 'auto',
				'align-self': key.rowSpan ? 'stretch' : 'center',
				'height': key.rowSpan ? `calc(40px * ${key.rowSpan})` : '40px'
			};
		},

		// Retorna las clases para las teclas del teclado
		getKeyClasses(key) {
			const classes = [];
			if (key.span) {
				classes.push(`span-${key.span}`);
			}
			if (key.class) {
				// Agregar todas las clases definidas en la propiedad 'class'
				const keyClasses = key.class.split(' ');
				keyClasses.forEach(cls => {
					classes.push(cls);
				});
			}
			if (key.id === 'kb_btn_NumpadEnter') {
				classes.push('numpad-enter');
			}
			return classes;
		},
		
		// Obtiene el color de una tecla según su estado
		getKeyColor(keyId) {
			// Si es una tecla errónea
			if (this.wrongKeys.has(keyId)) {
				return '#FF0000'; // Rojo
			}
			
			// Si la tecla existe en el estado
			if (this.keyState[keyId]) {
				return this.keyState[keyId].color;
			}
			
			// Color por defecto
			return 'rgba(255, 255, 255, 0.1)';
		},
		
		// Alternar entre colores para una tecla
		toggleKeyColor(keyId) {
			// Asegurarse de que exista un estado para la tecla
			if (!this.keyState[keyId]) {
				this.$set(this.keyState, keyId, { pressed: false, color: 'rgba(255, 255, 255, 0.1)' });
			}
			
			// Obtener el estado actual
			const state = this.keyState[keyId];
			
			// Alternar entre verde y naranja
			const newColor = state.color === '#00FF00' ? '#FFA500' : '#00FF00';
			
			// Actualizar el color
			this.$set(this.keyState[keyId], 'color', newColor);
		},

		// Alternar entre el teclado compacto y completo
		toggleKeyboard() {
			this.isCompact = !this.isCompact;
			// Reiniciar el estado de las teclas al cambiar de teclado
			this.keyState = {};
			this.wrongKeys.clear();
			this.allKeysPressed = false;
			this.saveStateToLocalStorage();
			
			// Quitar el foco después de cambiar el teclado - método más agresivo
			setTimeout(() => {
				// Intentar múltiples enfoques para quitar el foco
				if (document.activeElement) {
					document.activeElement.blur();
				}
				
				// Buscar específicamente el toggle y quitarle el foco
				const toggles = document.querySelectorAll('.q-toggle');
				toggles.forEach(toggle => {
					toggle.blur();
				});
				
				// Crear un elemento temporal, darle foco y luego quitárselo
				const tempElement = document.createElement('div');
				document.body.appendChild(tempElement);
				tempElement.setAttribute('tabindex', '-1');
				tempElement.focus();
				tempElement.blur();
				document.body.removeChild(tempElement);
			}, 50);
		},
		
		// Marcar una tecla como presionada
		pressKey(keyId) {
			if (!keyId) return;
			
			// Inicializar estado si no existe
			if (!this.keyState[keyId]) {
				this.$set(this.keyState, keyId, {
					pressed: false,
					color: 'rgba(255, 255, 255, 0.1)'
				});
			}
			
			// Si no estaba presionada antes, marcarla como presionada
			if (!this.keyState[keyId].pressed) {
				this.$set(this.keyState[keyId], 'pressed', true);
				this.$set(this.keyState[keyId], 'color', '#00FF00'); // Verde
			} else {
				// Si ya estaba presionada, alternar el color
				this.toggleKeyColor(keyId);
			}
			
			// Verificar si todas las teclas han sido presionadas
			this.checkAllKeysPressed();
			
			// Guardar estado en localStorage
			this.saveStateToLocalStorage();
		},
		
		// Verificar si se han presionado todas las teclas necesarias
		checkAllKeysPressed() {
			// Obtener todas las teclas que deben ser presionadas
			const requiredKeys = this.getAllRequiredKeyIds();
			
			// Verificar si todas las teclas requeridas han sido presionadas
			const allPressed = requiredKeys.every(keyId => 
				(this.keyState[keyId] && this.keyState[keyId].pressed) || this.noTest.includes(keyId)
			);
			
			this.allKeysPressed = allPressed;
			
			return allPressed;
		},
		
		// Obtener todos los IDs de teclas requeridas basado en el teclado actual
		getAllRequiredKeyIds() {
			const keyboardData = this.isCompact ? this.compactKeyboardData : this.completeKeyboardData;
			const keyIds = [];
			
			// Recorrer todas las filas y teclas para obtener sus IDs
			keyboardData.rows.forEach(row => {
				row.keys.forEach(key => {
					if (key.type === 'split-column') {
						// Para columnas divididas, agregar cada tecla individual
						key.keys.forEach(splitKey => {
							if (splitKey.id && !keyIds.includes(splitKey.id) && splitKey.id.indexOf('kb_btn_Blank') === -1) {
								keyIds.push(splitKey.id);
							}
						});
					} else if (key.id && !keyIds.includes(key.id) && key.id.indexOf('kb_btn_Blank') === -1) {
						// Agregar tecla normal si no es una tecla en blanco
						keyIds.push(key.id);
					}
				});
			});
			
			return keyIds;
		},
		
		// Reiniciar el estado de las teclas
		resetKeyboard() {
			// Reiniciar el estado de cada tecla
			this.keyState = {};
			this.wrongKeys.clear();
			this.allKeysPressed = false;
			this.allKeysPressedMessage = '';
			this.showStartModal = true;
			
			// Eliminar datos guardados
			localStorage.removeItem('keyboardTestState');
		},
		
		// Capturar el teclado como imagen y emitir resultado
		captureKeyboard(status) {
			const element = document.getElementById('kb_box');
			if (element) {
				html2canvas(element).then((canvas) => {
					const base64Image = canvas.toDataURL('image/png');
					const imageData = {
						ext: 'png',
						type: 'keyboard',
						base64: base64Image,
					};
					const message = status === 'pass' ? 'Keyboard test PASS' : 'Keyboard test FAIL';
					const result = {
						status: status === 'pass',
						...imageData,
						message: message,
					};

					// Guardar en localStorage
					localStorage.setItem('keyboardTestResult', JSON.stringify(result));

					// Emitir al componente padre
					this.$emit('input', result);

					this.resetKeyboard();
					this.showStartModal = true;
					this.allKeysPressedMessage = result.message;
				});
			}
		},
		
		// Manejar evento keydown
		handleKeydown(event) {
			// Si se presiona Ctrl+Escape, fallar inmediatamente la prueba
			if (event.ctrlKey && event.code === 'Escape') {
				this.captureKeyboard('fail');
				return;
			}
			
			// Evitar repetición de teclas
			const keyCode = event.keyCode;
			if (this.keydownSet[keyCode]) return;
			this.keydownSet[keyCode] = true;
			
			// Prevenir comportamiento predeterminado
			event.preventDefault();
			
			// Determinar el ID de la tecla
			let keyId = `kb_btn_${event.code}`;
			
			// Casos especiales
			if (event.code === 'Fn') {
				keyId = event.location === 1 ? 'kb_btn_FnLeft' : 'kb_btn_FnRight';
			} else if (event.code === 'ContextMenu') {
				keyId = 'kb_btn_ContextMenu';
			} else if (event.code === 'Meta') {
				keyId = event.location === 1 ? 'kb_btn_MetaLeft' : 'kb_btn_MetaRight';
			}
			
			// Verificar si la tecla existe en el teclado actual
			const keyExists = this.checkKeyExists(keyId);
			
			if (keyExists) {
				// Marcar la tecla como presionada
				this.pressKey(keyId);
			} else {
				// Marcar como tecla errónea
				this.handleWrongKey(keyId, event.code);
			}
		},
		
		// Verificar si una tecla existe en el teclado actual
		checkKeyExists(keyId) {
			const keyboardData = this.isCompact ? this.compactKeyboardData : this.completeKeyboardData;
			let exists = false;
			
			// Buscar la tecla en todas las filas
			keyboardData.rows.forEach(row => {
				row.keys.forEach(key => {
					if (key.type === 'split-column') {
						// Buscar en columnas divididas
						key.keys.forEach(splitKey => {
							if (splitKey.id === keyId) {
								exists = true;
							}
						});
					} else if (key.id === keyId) {
						exists = true;
					}
				});
			});
			
			return exists;
		},
		
		// Manejar tecla errónea
		handleWrongKey(keyId, code) {
			// Agregar a la lista de teclas erróneas
			this.wrongKeys.add(keyId);
			
			// Buscar la tecla correspondiente en el otro teclado
			const otherKeyboardData = this.isCompact ? this.completeKeyboardData : this.compactKeyboardData;
			let correctKeyId = null;
			
			// Buscar la tecla correcta en el otro teclado
			otherKeyboardData.rows.forEach(row => {
				row.keys.forEach(key => {
					if (key.type === 'split-column') {
						key.keys.forEach(splitKey => {
							if (splitKey.id === keyId) {
								correctKeyId = splitKey.id;
							}
						});
					} else if (key.id === keyId) {
						correctKeyId = key.id;
					}
				});
			});
			
			// Mostrar notificación de error
			this.$q.notify({
				type: 'warning',
				message: `Key mismatch: ${code} pressed but not available in current keyboard layout`,
				position: 'top',
				timeout: 3000
			});
		},
		
		// Manejar evento keyup
		handleKeyup(event) {
			const keyCode = event.keyCode;
			if (this.keydownSet[keyCode]) {
				delete this.keydownSet[keyCode];
			}
		},
		
		// Desactivar comportamiento predeterminado de teclas
		disableDefaultKeys(event) {
			if (event.ctrlKey && event.code === 'Escape') {
				return;
			}
			event.preventDefault();
		},
		
		// Habilitar comportamiento predeterminado de teclas
		enableDefaultKeys() {
			document.removeEventListener('keydown', this.disableDefaultKeys, { capture: true });
		},
		
		// Iniciar captura de teclas
		startCapture() {
			this.showStartModal = false;
			document.addEventListener('keydown', this.disableDefaultKeys, { capture: true });
			window.addEventListener('keydown', this.handleKeydownBound, { capture: true });
			window.addEventListener('keyup', this.handleKeyupBound, { capture: true });
			this.allKeysPressedMessage = '';
		},
		
		// Guardar estado en localStorage
		saveStateToLocalStorage() {
			const state = {
				keyState: this.keyState,
				wrongKeys: Array.from(this.wrongKeys),
				allKeysPressedMessage: this.allKeysPressedMessage,
				showStartModal: this.showStartModal,
				isCompact: this.isCompact
			};
			
			localStorage.setItem('keyboardTestState', JSON.stringify(state));
		},
		
		// Cargar estado desde localStorage
		loadStateFromLocalStorage() {
			const savedState = localStorage.getItem('keyboardTestState');
			if (savedState) {
				const state = JSON.parse(savedState);
				this.keyState = state.keyState || {};
				this.wrongKeys = new Set(state.wrongKeys || []);
				this.allKeysPressedMessage = state.allKeysPressedMessage || '';
				this.showStartModal = state.showStartModal !== undefined ? state.showStartModal : true;
				this.isCompact = state.isCompact !== undefined ? state.isCompact : false;
				
				// Verificar si todas las teclas han sido presionadas
				this.checkAllKeysPressed();
			}
		},
		
		// Cargar datos desde la base de datos
		async fetchKeyboardData() {
			try {
				this.$q.loading.show();
				const response = await this.$db.collection('TestSettings').conditions({ Description: 'Keyboard' }).admin().get();

				this.compactKeyboardData = response[0].compact || { rows: [] };
				this.completeKeyboardData = response[0].complete || { rows: [] };
				this.noTest = response[0].noTest || [];

				// Forzar la actualización de la vista
				this.$nextTick(() => {
					this.isCompact = false; // Asegurar que inicia con el teclado completo
					this.checkAllKeysPressed();
				});

				this.$q.loading.hide();
			} catch (error) {
				console.error('Error fetching data:', error);
				this.$q.loading.hide();
			}
		},
		
		// Método para desenfocar después de cambiar el toggle
		blurAfterToggle() {
			// Desenfocar el elemento actual
			if (document.activeElement) {
				document.activeElement.blur();
			}
		},
	},

	created() {
		// Enlazar funciones para eventos de teclado
		this.handleKeydownBound = this.handleKeydown.bind(this);
		this.handleKeyupBound = this.handleKeyup.bind(this);
		this.loadStateFromLocalStorage();
	},

	mounted() {
		this.fetchKeyboardData();
		
		// Configurar un event listener global para asegurar que el toggle nunca mantiene el foco
		document.addEventListener('mousedown', (e) => {
			// Si hay un elemento activo y no es el cuerpo del documento
			if (document.activeElement && document.activeElement !== document.body) {
				// Quitar el foco
				document.activeElement.blur();
			}
		});
	},
	
	beforeDestroy() {
		// Limpiar los escuchadores de eventos para evitar problemas de memoria
		window.removeEventListener('keydown', this.handleKeydownBound, { capture: true });
		window.removeEventListener('keyup', this.handleKeyupBound, { capture: true });
		document.removeEventListener('keydown', preventToggleSpaceActivation, { capture: true });
		this.enableDefaultKeys();
		
		// Eliminar el event listener global
		document.removeEventListener('mousedown', this.blurFocusedElement);
	},
};
</script>

<style scoped>
/* Contenedor del teclado */
.keyboard-container {
	display: grid;
	gap: 5px;
	padding: 10px;
	background-color: #fff;
	border: 2px solid #ccc;
	border-radius: 10px;
	box-sizing: border-box;
	user-select: none;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Definir correctamente la cuadrícula */
.complete-row {
	display: grid;
	grid-template-columns: repeat(22, 1fr); /* 22 columnas fijas */
	grid-template-rows: repeat(auto-fill, 40px); /* Filas dinámicas */
	gap: 5px;
}

/* Teclas normales */
.key {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	border: 1px solid #ccc;
	border-radius: 5px;
	font-size: 12px;
	padding: 5px;
	box-sizing: border-box;
	cursor: pointer;
	transition: background-color 0.2s, transform 0.2s;
	min-width: 40px;
	min-height: 40px;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	pointer-events: none;
}

.key:active {
	transform: scale(0.95);
}

/* Evita que las teclas altas empujen filas */
.key.numpad-enter {
	grid-row: span 2 !important;
	align-self: stretch; /* No empujar filas */
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 80px; /* Doble de altura */
}

/* Ajuste de espacio en teclas que ocupan varias columnas */
.key.span-2 {
	grid-column: span 2;
}
.key.span-3 {
	grid-column: span 3;
}
.key.span-4 {
	grid-column: span 4;
}
.key.span-6 {
	grid-column: span 6;
}

/* Espacio para teclas especiales */
.key.space {
	grid-column: span 6;
}

/* Asegurar que Shift y Enter sean más grandes */
.key.shift,
.key.enter {
	font-weight: bold;
}

/* Teclado compacto */
.compact-keyboard-container {
	max-width: fit-content;
	margin: 0 auto;
}

.compact-row {
	display: grid;
	grid-template-columns: repeat(15, 1fr);
	gap: 5px;
}

/* Soporte para teclas divididas */
.split-column {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	gap: 5px;
	align-items: center;
	width: 100%;
}

.split-key {
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid #aaa;
	border-radius: 3px;
	font-size: 12px;
	box-sizing: border-box;
	width: 100%;
	cursor: pointer;
	padding: 5px;
	transition: background-color 0.2s, transform 0.2s;
}

.split-key:active {
	transform: scale(0.95);
}

.key.blank {
	visibility: hidden;
}

.success-message {
	margin-top: 10px;
	font-size: 1.2rem;
	color: #00ff00;
	text-align: center;
}

.start-modal {
	min-height: 200px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 20px;
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

/* Contenedor principal */
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
	user-select: none;
	position: relative;
}

/* Controles */
#kb_box_b {
	width: 100%;
	max-width: 600px;
	margin: 0 auto;
}
</style>