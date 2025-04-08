<template>
	<div>
		<!-- Selector de color con imagen y color box -->
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
			:style="{ textTransform: 'uppercase', height: '56px' }"
		>
			<template v-slot:option="scope">
				<q-item v-bind="scope.itemProps" v-on="scope.itemEvents" class="q-hoverable">
					<!-- Image thumbnail on the left with hover effect -->
					<div class="image-container">
						<q-avatar square size="32px" class="q-mr-sm">
							<img v-if="scope.opt.image" :src="scope.opt.image" alt="color thumbnail" />
							<q-icon v-else name="image_not_supported" />
						</q-avatar>
						<div v-if="scope.opt.image" class="image-popup">
							<img :src="scope.opt.image" alt="color thumbnail" width="400px" />
						</div>
					</div>

					<!-- Color label in the center -->
					<q-item-section>{{ scope.opt.label }}</q-item-section>

					<!-- Color box on the right with adjustable width -->
					<q-item-section side v-if="scope.opt.color">
						<div
							:style="{
								backgroundColor: scope.opt.color,
								width: '72px' /* 3 times the original width */,
								height: '24px',
								borderRadius: '4px',
							}"
						></div>
					</q-item-section>
				</q-item>
			</template>
		</q-select>
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
			brand: {
				type: String,
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
			brand: {
				immediate: true,
				handler(newVal) {
					if (newVal) {
						this.initializeColors(this.partsurfer)
					}
				},
			},
		},
		methods: {
			async initializeColors(partsurfer) {
				try {
					if (partsurfer && partsurfer.COLOR) {
						this.selectedColor = partsurfer.COLOR.toUpperCase()
						this.emitColorSelected(this.selectedColor)
					}

					let colors = await this.$db
						.collection(`${this.brand == 'HP' ? 'GenericColor' : 'GenericColor'}`)
						.admin()
						.get()
					this.colorOptions = colors.map((color) => ({
						label: color.Description.toUpperCase(),
						value: color.Description.toUpperCase(),
						color: color.Color || '', // Default to empty string if no color
						image: color.Image || '', // Default to empty string if no image
					}))

					if (partsurfer.ColorList && partsurfer.ColorList.length > 0) {
						this.setRecommendedColors(partsurfer.ColorList)
					}

					this.filteredColorOptions = [...this.colorOptions]
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
				// Crear el encabezado RECOMMENDED y luego agregar los colores recomendados debajo
				const recommendedHeader = { label: 'RECOMMENDED', header: true, disable: true }
				const recommended = recommendedColors.map((color) => {
					const foundColor =
						this.colorOptions.find(
							(option) => option.label.toUpperCase() === color.toUpperCase(),
						) || {}
					return {
						label: color.toUpperCase(),
						value: color.toUpperCase(),
						color: foundColor.color || color.Color || '', // Prioriza el color encontrado, si no el color dado
						image: foundColor.image || color.Image || '', // Prioriza la imagen encontrada, si no la imagen dada
					}
				})

				// Ordenar los recomendados por label
				recommended.sort((a, b) => a.label.localeCompare(b.label))

				// Crear el encabezado GENERAL como encabezado para los colores no recomendados
				const generalHeader = { label: 'GENERAL', header: true, disable: true }
				const nonRecommended = this.colorOptions.filter(
					(option) => !recommendedColors.includes(option.label.toUpperCase()),
				)

				// Ordenar los no recomendados por label
				nonRecommended.sort((a, b) => a.label.localeCompare(b.label))

				// Combinar todo: primero los recomendados con su encabezado, luego los generales
				this.colorOptions = [
					recommendedHeader, // Primero, el encabezado RECOMMENDED
					...recommended, // Después, los colores recomendados (ordenados alfabéticamente)
					generalHeader, // Luego, el encabezado GENERAL
					...nonRecommended, // Finalmente, los colores no recomendados (ordenados alfabéticamente)
				]
			},
			filterColors(val, update) {
				const needle = val.toUpperCase()
				update(() => {
					this.filteredColorOptions = this.colorOptions.filter(
						(option) => option.header || option.label.includes(needle),
					)
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

	/* Container for the image with hover effect */
	.image-container {
		position: relative;
		display: inline-block;
	}

	/* Enlarged image on hover */
	.image-container .image-popup {
		display: none;
		position: absolute;
		top: -210px; /* Adjust as needed */
		left: 40px; /* Adjust as needed */
		z-index: 100;
		max-width: 400px; /* Max width for the enlarged image */
		pointer-events: none; /* Ensure the image popup does not interfere with selection */
	}

	/* Show the enlarged image on hover */
	.image-container:hover .image-popup {
		display: block;
	}
</style>
