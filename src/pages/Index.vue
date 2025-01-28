<template>
	<q-page>
		<q-card class="q-card-container">
			<!-- <q-card class="corner-card top-left" @click="cornerAction('top-left')">
				<q-item>
					<q-item-section class="image-section">
						<img src="SYSINFO.png" class="detail-image" />
					</q-item-section>
				</q-item>
				<q-item-section>
					<q-item-label style="font-size: 10px">System Info</q-item-label>
				</q-item-section>
			</q-card>
			<q-card
				class="corner-card top-right"
				@click="toggleQualityAssurance"
				:class="{ selected: isQualityAssuranceSelected }"
			>
				<q-item>
					<q-item-section class="image-section">
						<img :src="isQualityAssuranceSelected ? 'QA-A.png' : 'QA-D.png'" class="detail-image" />
					</q-item-section>
				</q-item>
				<q-item-section>
					<q-item-label style="font-size: 10px">Quality Assurance</q-item-label>
				</q-item-section>
			</q-card> -->
			<div v-for="category in data" :key="category._id" class="category-container">
				<h2>{{ category.Category }}</h2>
				<div class="details-container">
					<q-card
						v-for="detail in category.Details"
						:key="detail.Type"
						class="q-ma-sm detail-card"
						@click="navigateTo(detail.Route, detail.Type)"
					>
						<q-item>
							<q-item-section class="image-section">
								<img :src="detail.Image" alt="detail.Type" class="detail-image" />
							</q-item-section>
						</q-item>
						<q-item-section>
							<q-item-label style="font-size: 10px">{{ detail.Type }}</q-item-label>
						</q-item-section>
					</q-card>
				</div>
			</div>
		</q-card>
	</q-page>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		data() {
			return {
				data: [],
				isQualityAssuranceSelected: false,
			}
		},
		computed: {
			...mapState(['informationBios', 'advancedBios', 'type']), // Mapea las propiedades del estado a las variables locales
		},
		methods: {
			toggleQualityAssurance() {
				this.isQualityAssuranceSelected = !this.isQualityAssuranceSelected
			},
			navigateTo(route, type) {
				this.$store.state.type = type
				this.$router.push({
					path: `/${route.toLowerCase()}`,
					query: {
						type,
						//informationBios: this.informationBios,
					},
				})
			},
			cornerAction(position) {
				console.log(`Action triggered from ${position} corner.`)
			},
			async scrapping() {
				if (!this.scrappingPromise) {
					this.$q.loading.show()
					// Solo inicializa la promesa si no existe
					this.scrappingPromise = (async () => {
						try {
							// Ejecutar las consultas asincrónicas concurrentemente
							let [info] = await Promise.all([this.$system()])
							// Asignar resultados a variables
							this.$store.state.informationBios = info
							if (
								info.system.manufacturer.toUpperCase() == 'HP' ||
								info.system.manufacturer.toUpperCase() == 'HEWLETT-PACKARD'
							)
								this.$store.state.advancedBios = await this.$cmd.biosData()

							this.$q.loading.hide()
							//else this.bios = {}
						} catch (error) {
							// Manejo de errores
							this.$q.loading.hide()
							this.$q
								.dialog({
									title: 'Error',
									message: `An error occurred during the scrapping of the information: ${error.message}`,
									persistent: true,
									color: 'red',
									ok: {
										label: 'Retry',
									},
								})
								.onOk(() => {
									this.scrapping() // Reintenta el proceso
								})
							throw error // Lanza el error para que sea manejado si es necesario
						}
					})()
				}
				return this.scrappingPromise // Retorna la promesa para que pueda ser usada
			},
		},
		async mounted() {
			this.data = await this.$db
				.collection('TestSettings')
				.conditions({ Description: 'testType' })
				.admin()
				.get()
			console.log(new Date())
			await this.scrapping()
			console.log(new Date())
		},
	}
</script>

<style scoped>
	.q-card-container {
		width: 80%;
		margin: 0 auto;
		padding: 20px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		background-color: white;
		position: relative;
	}

	.corner-card {
		width: auto;
		position: absolute;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		padding: 10px; /* Updated to match q-card-container padding */
		border: 1px solid transparent;
		border-radius: 8px;
		background: linear-gradient(145deg, #f3f3f3, #e6e6e6);
		box-shadow: 3px 3px 6px #cccccc, -3px -3px 6px #ffffff;
	}

	.corner-card.selected {
		box-shadow: 0 0 15px 3px rgba(0, 120, 215, 0.75);
		background: linear-gradient(145deg, #e6f7ff, #d4efff);
	}

	.corner-card:hover {
		transform: scale(1.05);
		box-shadow: 4px 4px 10px #bbbbbb, -4px -4px 10px #ffffff;
		background: linear-gradient(145deg, #e6e6e6, #f3f3f3);
	}

	.corner-card:active {
		transform: scale(0.95);
		box-shadow: inset 2px 2px 4px #cccccc, inset -2px -2px 4px #ffffff;
	}

	.top-left {
		top: 5px;
		left: 5px;
	}

	.top-right {
		top: 5px;
		right: 5px;
		gap: 24px;
	}

	.category-container {
		text-align: center;
		padding: 10px;
	}

	.details-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 24px;
	}

	.detail-card {
		width: 100px;
		height: 100px;
		text-align: center;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		padding: 10px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: linear-gradient(145deg, #f3f3f3, #e6e6e6);
		box-shadow: 3px 3px 6px #cccccc, -3px -3px 6px #ffffff;
	}

	.detail-card:hover {
		transform: scale(1.05);
		box-shadow: 4px 4px 10px #bbbbbb, -4px -4px 10px #ffffff;
		background: linear-gradient(145deg, #e6e6e6, #f3f3f3);
	}

	.detail-card:active {
		transform: scale(0.95);
		box-shadow: inset 2px 2px 4px #cccccc, inset -2px -2px 4px #ffffff;
	}

	.image-section {
		display: flex;
		justify-content: center;
	}

	.detail-image {
		width: 40px;
		height: 40px;
		object-fit: cover;
		margin-bottom: 8px;
		border-radius: 4px;
	}

	h2 {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 10px;
		color: var(--q-primary);
	}
</style>
