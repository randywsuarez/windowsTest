<template>
	<q-page>
		<q-card class="q-card-container">
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
	export default {
		data() {
			return {
				data: [],
			}
		},
		methods: {
			navigateTo(route, type) {
				this.$router.push({ path: `/${route.toLowerCase()}`, query: { type } })
			},
		},
		async mounted() {
			this.data = await this.$db
				.collection('TestSettings')
				.conditions({ Description: 'testType' })
				.admin()
				.get()
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
