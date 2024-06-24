<template>
	<div id="kb_box" style="min-height: 200px">
		<div id="kb_box_l">
			<div v-for="row in keyRows" :key="row.id" class="kb_row">
				<div
					v-for="key in row.keys"
					:key="key.id"
					:class="['kb_btn', key.size, key.class]"
					:id="key.id"
					:style="{ backgroundColor: key.pressed ? '#FFCA13' : '' }"
				>
					<span v-html="key.label"></span>
				</div>
			</div>
		</div>
		<div id="kb_box_b">
			<input type="button" @click="resetKeyboard" value="Reset" class="reset_kb_btn" />
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				keyRows: [
					{
						id: 1,
						keys: [
							{ id: 'kb_btn_27', label: 'Esc', size: 'kb_btn_small', pressed: false },
							{ id: 'kb_btn_112', label: 'F1', size: 'kb_btn_small', pressed: false },
							{ id: 'kb_btn_113', label: 'F2', size: 'kb_btn_small', pressed: false },
							// Agrega todas las teclas aquí siguiendo el patrón anterior
						],
					},
					{
						id: 2,
						keys: [
							{ id: 'kb_btn_9', label: 'Tab', size: 'kb_btn_medium', pressed: false },
							{ id: 'kb_btn_81', label: 'Q', size: 'kb_btn_small', pressed: false },
							{ id: 'kb_btn_87', label: 'W', size: 'kb_btn_small', pressed: false },
							// Agrega todas las teclas aquí siguiendo el patrón anterior
						],
					},
					// Agrega más filas según sea necesario
				],
			}
		},
		methods: {
			pressKey(keyId) {
				const row = this.keyRows.find((row) => row.keys.some((key) => key.id === keyId))
				const key = row ? row.keys.find((k) => k.id === keyId) : null
				if (key) {
					key.pressed = !key.pressed
					this.checkAllKeysPressed()
				}
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
				const keyId = `kb_btn_${event.keyCode}`
				this.pressKey(keyId)
			},
			handleKeyup(event) {
				// Logic for keyup if needed
			},
			addKeyboardListeners() {
				window.addEventListener('keydown', this.handleKeydown)
				window.addEventListener('keyup', this.handleKeyup)
			},
			removeKeyboardListeners() {
				window.removeEventListener('keydown', this.handleKeydown)
				window.removeEventListener('keyup', this.handleKeyup)
			},
		},
		mounted() {
			this.addKeyboardListeners()
		},
		beforeDestroy() {
			this.removeKeyboardListeners()
		},
	}
</script>

<style scoped>
	#kb_box {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#kb_box_l {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
	}
	.kb_row {
		display: flex;
		width: 100%;
	}
	.kb_btn {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1rem;
		margin: 3px;
		padding: 5px;
		background-color: #012733;
		border: 1px solid #ccc;
		color: #f0f8ff;
		box-sizing: border-box;
		text-align: center;
	}
	.kb_btn_small {
		flex: 1 1 3%;
	}
	.kb_btn_medium {
		flex: 1 1 6%;
	}
	.kb_btn_large {
		flex: 1 1 12%;
	}
	.reset_kb_btn {
		margin-top: 20px;
		padding: 10px 20px;
		background-color: #102733;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	@media (max-width: 500px) {
		.kb_btn {
			font-size: 0.8rem;
			padding: 3px;
		}
		.reset_kb_btn {
			padding: 8px 16px;
		}
	}
</style>
