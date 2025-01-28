<template>
	<div class="row col">
		<!-- Check Label -->
		<q-expansion-item
			expand-separator
			:default-opened="true"
			dense
			header-class="bg-grey-3 text-bold full-width-header"
			class="row col-6"
		>
			<template v-slot:header>
				<div class="text-teal">
					<q-icon name="label" />
					Check Label
				</div>
			</template>

			<div class="row col-12 q-mb-lg">
				<q-input
					dense
					ref="serial"
					standout="bg-teal text-white"
					v-model="form.serial"
					@input="
						v$.form.serial.$touch()
						handleInputChange('serial')
						validateSerial()
					"
					:prefix="miniSerial"
					placeholder="XX"
					hint="Write the last 2 digits"
					type="text"
					maxlength="2"
					label="Serial"
					:error="v$.form.serial.$error"
					:error-message="
						v$.form.serial.required ? 'Serial is required' : 'Serial must be exactly 2 characters.'
					"
					class="col-6 q-pa-sm"
				/>
				<q-input
					dense
					ref="sku"
					standout="bg-teal text-white"
					v-model="form.sku"
					@input="
						v$.form.sku.$touch()
						handleInputChange('sku')
						validateSKU()
					"
					type="text"
					label="SKU/Model"
					:prefix="miniSKU"
					placeholder="XXXX"
					hint="Write the missing"
					maxlength="4"
					:error="v$.form.sku.$error"
					:error-message="
						v$.form.sku.required ? 'SKU is required' : 'SKU must be at least 4 characters.'
					"
					class="col-6 q-pa-sm"
				/>
			</div>
		</q-expansion-item>
		<!-- HotKeys -->
		<q-expansion-item
			expand-separator
			:default-opened="true"
			dense
			header-class="bg-grey-3 text-bold full-width-header"
			class="row col-6"
			v-if="type === 'LAPTOP'"
		>
			<template v-slot:header>
				<div class="text-teal">
					<q-icon name="label" />
					Hotkeys
				</div>
			</template>

			<div class="row col-12">
				<q-checkbox size="xl" v-model="hotkey.mic" val="80px" label="Mic" class="col-3" />
				<q-checkbox size="xl" v-model="hotkey.privacy" val="80px" label="Privacy" class="col-3" />
				<q-checkbox size="xl" v-model="hotkey.speakers" val="80x" label="Speakers" class="col-3" />
				<q-checkbox
					size="xl"
					v-model="hotkey.brights"
					val="80px"
					label="Brightness"
					class="col-3"
				/>
			</div>
		</q-expansion-item>
		<!-- Components -->
		<q-expansion-item
			expand-separator
			:default-opened="true"
			dense
			header-class="bg-grey-3 text-bold full-width-header"
			class="row col-6"
			v-if="(type === 'LAPTOP' || type === 'TABLET') && components.Product == 'CTO'"
		>
			<template v-slot:header>
				<div class="text-teal">
					<q-icon name="label" />
					Components
				</div>
			</template>

			<div class="row col-12">
				<q-checkbox
					size="xl"
					v-model="components.WWAN"
					true-value="YES"
					false-value="NO"
					label="WWAN"
				/>
				<q-checkbox
					size="xl"
					v-model="components.WLAN"
					true-value="YES"
					false-value="NO"
					label="WLAN"
				/>
				<q-checkbox
					size="xl"
					v-model="components.Keyboard.Privacy"
					true-value="YES"
					false-value="NO"
					label="Privacy"
				/>
				<q-checkbox
					size="xl"
					v-model="components.NFC"
					true-value="YES"
					false-value="NO"
					label="NFC"
				/>
				<q-checkbox
					size="xl"
					v-model="components.SmartCard"
					true-value="YES"
					false-value="NO"
					label="Smart Card"
				/>
				<q-checkbox
					size="xl"
					v-model="components.Keyboard.Backlight"
					true-value="YES"
					false-value="NO"
					label="Backlight"
				/>
				<q-checkbox
					size="xl"
					v-model="components.Keyboard.RGB"
					true-value="YES"
					false-value="NO"
					label="RGB Keyboard"
				/>
				<q-checkbox
					size="xl"
					v-model="components.Fingerprint"
					true-value="YES"
					false-value="NO"
					label="Fingerprint"
				/>
			</div>
		</q-expansion-item>
		<!-- Color -->
		<q-expansion-item
			expand-separator
			:default-opened="true"
			dense
			header-class="bg-grey-3 text-bold full-width-header"
			class="row col-6"
			v-if="
				(type === 'LAPTOP' || type === 'TABLET' || type === 'ALL-IN-ONE' || type === 'DESKTOP') &&
				components.Product == 'CTO'
			"
		>
			<template v-slot:header>
				<div class="text-teal">
					<q-icon name="label" />
					Unit color
				</div>
			</template>

			<div class="row col-12">
				<ColorSelect
					class="col-6"
					:partsurfer="components.infoTest"
					@color-selected="handleColorSelected"
					:brand="components.information.brand"
					:colorType="components.validateUnit.colorType"
				/>
			</div>
		</q-expansion-item>
		<!-- Desktop Information -->
		<q-expansion-item
			expand-separator
			:default-opened="true"
			dense
			header-class="bg-grey-3 text-bold full-width-header"
			class="row col-6"
			v-if="type === 'DESKTOP' && components.Product == 'CTO'"
		>
			<template v-slot:header>
				<div class="text-teal">
					<q-icon name="label" />
					Desktop Information
				</div>
			</template>

			<div class="row col-12">
				<q-select
					dense
					standout="bg-teal text-white"
					v-model="form.coolerSystem"
					:options="coolingOptions"
					label="Cooling System"
					filled
					class="col-6 q-pa-sm"
				/>
				<q-input
					ref="adapter"
					dense
					standout="bg-teal text-white"
					v-model="form.Adapter"
					type="number"
					label="Adapter/PowerSupply"
					class="col-6 q-pa-sm"
				/>
				<q-input
					ref="note"
					dense
					standout="bg-teal text-white"
					v-model="form.note"
					type="textarea"
					label="Note"
					class="col-6 q-pa-sm"
				/>
				<q-checkbox
					ref="lightRAM"
					left-label
					v-model="form.lightRAM"
					label="RGB RAM"
					class="col-6 q-pa-sm"
				/>
			</div>
		</q-expansion-item>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import useVuelidate from '@vuelidate/core'
	import { required, minLength, helpers } from '@vuelidate/validators'

	export default {
		data() {
			return {
				hotkey: {
					mic: false,
					speakers: false,
					brights: false,
					privacy: false,
				},
				components: {
					Keyboard: {},
				},
				form: {
					serial: '',
					sku: '',
					note: '',
					coolerSystem: null,
					lightRAM: false,
					Adapter: null,
				},
				activate: {
					note: true,
					desktop: false,
					information: false,
					gpu: false,
				},
				driver: {},
				windowsDPK: {},
				miniSerial: '',
				miniSKU: '',
				coolingOptions: [
					{ label: 'Air Cooling', value: 'air' },
					{ label: 'Liquid Cooling', value: 'liquid' },
				],
				columns: [
					{
						name: 'Description',
						required: true,
						label: 'Description',
						align: 'left',
						field: 'Description',
					},
					{
						name: 'AdapterRAM',
						required: true,
						label: 'Adapter RAM',
						align: 'left',
						field: 'AdapterRAM',
					},
				],
			}
		},
		validations() {
			return {
				form: {
					serial: {
						required: helpers.withMessage('Serial is required', required),
						minLength: helpers.withMessage('Serial must be exactly 2 characters.', minLength(2)),
					},
					sku: {
						required: helpers.withMessage('SKU is required', required),
						minLength: helpers.withMessage('SKU must be at least 4 characters.', minLength(4)),
					},
				},
			}
		},
		computed: {
			...mapState(['informationBios', 'advancedBios', 'type', 'hardwareInfo']),
		},
		methods: {
			handleInputChange(id) {
				this.form[id] = this.form[id].toUpperCase()
			},
			validateSerial() {
				console.log(`${this.miniSerial}${this.form.serial}`)
				if (
					this.components.information.Serial !== `${this.miniSerial}${this.form.serial}` &&
					this.components.information.Serial.length ===
						`${this.miniSerial}${this.form.serial}`.length
				) {
					this.$q.notify({
						type: 'negative',
						message: 'Serial does not match the expected value.',
					})
				} else if (
					this.components.information.Serial === `${this.miniSerial}${this.form.serial}` &&
					this.components.information.Serial.length ===
						`${this.miniSerial}${this.form.serial}`.length
				) {
					this.$refs.sku.focus()
				}
			},
			handleColorSelected(color) {
				if (color) {
					this.components.information['Color'] = color
				}
			},
			validateSKU() {
				if (
					this.components.information.Model !== `${this.miniSKU}${this.form.sku}` &&
					`${this.miniSKU}${this.form.sku}`.length == this.components.information.Model.length
				) {
					this.$q.notify({
						type: 'negative',
						message: 'SKU does not match the expected value.',
					})
				}
			},
			async scrapping() {
				this.systemInformation = this.$si()
				try {
					const driversCode = await this.$db.funcAdmin('modules/powershell/drivers')
					const statusWindows = await this.$db.funcAdmin('modules/powershell/statusWindows')
					let [drivers, winDPK] = await Promise.all([
						this.$cmd.executeScriptCode(driversCode),
						this.$cmd.executeScriptCode(statusWindows),
					])
					this.driver = drivers
					this.windowsDPK = winDPK
				} catch (error) {
					this.$q
						.dialog({
							title: 'Error',
							message: `Scrapping failed: ${error.message}`,
							persistent: true,
							color: 'red',
							ok: { label: 'Retry' },
						})
						.onOk(() => {
							this.scrapping()
						})
				}
			},
			async saveComponent() {
				console.log({
					systemInformation: {
						...this.informationBios,
						...this.hardwareInfo,
						...this.systemInformation,
						drivers: this.driver,
						statusDPK: this.windowsDPK,
						advancedBios: this.advancedBios,
					},
					type: this.type,
				})
				this.$db
					.funcAdmin('modules/windowsTest/index', {
						systemInformation: {
							...this.informationBios,
							...this.hardwareInfo,
							...this.systemInformation,
							drivers: this.driver,
							statusDPK: this.windowsDPK,
							advancedBios: this.advancedBios,
						},
						type: this.type,
					})
					.then(async (v) => {
						this.components = v.information
						this.miniSerial = v.information.Serial.slice(0, -2)
						this.miniSKU = v.information.Model.includes('#')
							? v.information.Model.split('#')[0].slice(0, -2)
							: v.information.Model.slice(0, -4)
					})
					.catch((e) => {
						console.log(e)

						this.$q
							.dialog({
								title: 'Error',
								message: `Validate information failed: ${error.message}`,
								persistent: true,
								color: 'red',
								ok: { label: 'Retry' },
							})
							.onOk(async () => {
								await this.saveComponent()
							})
					})
			},
		},
		setup() {
			const v$ = useVuelidate()
			return { v$ }
		},
		async mounted() {
			this.$q.loading.show()
			this.currentType = this.$route.query.type
				? this.$route.query.type.toUpperCase()
				: this.currentType
			await this.scrapping()
			this.systemInformation = await this.systemInformation
			console.log(this.informationBios, this.driver, this.windowsDPK)
			this.saveComponent()
			this.$q.loading.hide()
		},
	}
</script>

<style scoped>
	.q-gutter-md {
		margin-bottom: 1rem;
	}
	.q-mt-sm {
		margin-top: 0.5rem;
	}
	.q-my-sm {
		margin: 0.5rem 0;
	}
	.full-width-header {
		width: 100%; /* Asegura que el header cubra todo el ancho */
		display: flex; /* Alinea el contenido horizontalmente */
		justify-content: space-between; /* Espacia elementos dentro del header */
		padding: 10px; /* Ajusta el espacio interior */
		box-sizing: border-box; /* Incluye el padding dentro del ancho total */
	}
</style>
