<template>
	<div>
		<!-- Selector de color -->
		<q-select
			v-model="selectedColor"
			label="COLOR"
			:options="filteredColorOptions"
			option-label="label"
			option-value="value"
			filled
			clearable
			use-input
			@filter="filterColors"
			@input="emitColorSelected"
			class="q-mb-md"
			:style="{ textTransform: 'uppercase' }"
		/>
	</div>
</template>

<script>
	import { Notify } from 'quasar'

	export default {
		props: {
			partsurfer: {
				type: Object,
				required: true,
			},
		},
		data() {
			return {
				selectedColor: null,
				colorOptions: [],
				filteredColorOptions: [],
			}
		},
		watch: {
			partsurfer: {
				immediate: true,
				handler(newVal) {
					if (newVal) {
						this.initializeColors(newVal)
					}
				},
			},
		},
		methods: {
			async initializeColors(partsurfer) {
				try {
					// Si existe partsurfer.COLOR, seleccionarlo pero continuar con la inicialización
					if (partsurfer && partsurfer.COLOR) {
						//console.log('DEBUG: specs.COLOR =', partsurfer.COLOR)
						this.selectedColor = partsurfer.COLOR.toUpperCase()
						this.emitColorSelected(this.selectedColor)
					}

					// Obtener la lista de colores generales
					let colors = await this.$db.collection('HPColor').admin().get()
					this.colorOptions = Array.from(
						new Set(colors.map((v) => v.Description.toUpperCase())),
					).map((color) => ({
						label: color,
						value: color,
					}))

					//console.log('DEBUG: colorOptions =', this.colorOptions)

					// Si hay colores recomendados, agregarlos
					if (partsurfer.ColorList && partsurfer.ColorList.length > 0) {
						this.setRecommendedColors(partsurfer.ColorList)
					}

					// Actualizar las opciones filtradas
					this.filteredColorOptions = [...this.colorOptions]
					//console.log('DEBUG: filteredColorOptions =', this.filteredColorOptions)
				} catch (error) {
					console.error('Error during colors initialization:', error)
					Notify.create({
						message: 'An error occurred while loading colors',
						color: 'negative',
						position: 'top-right',
					})
				}
			},
			setRecommendedColors(recommendedColors) {
				const recommended = [
					{ label: 'RECOMMENDED', header: true, disable: true },
					...recommendedColors.map((color) => ({
						label: color.toUpperCase(),
						value: color.toUpperCase(),
					})),
				]
				this.colorOptions = [...recommended, ...this.colorOptions]
			},
			filterColors(val, update) {
				const needle = val.toUpperCase()
				update(() => {
					this.filteredColorOptions = this.colorOptions.filter(
						(option) => option.header || option.label.includes(needle),
					)
					//console.log('DEBUG: Filtered Color Options =', this.filteredColorOptions)
				})
			},
			emitColorSelected(color) {
				this.$emit('color-selected', color.value)
			},
		},
	}
</script>

<style scoped>
	.q-mb-md {
		margin-bottom: 16px;
	}
</style>
