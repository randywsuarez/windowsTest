<template>
	<q-page class="" style="padding-top: 10px">
		<user-info-grid
			:username="user.usuario"
			:project="user.tenant"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
		/>
		<!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    > -->
	</q-page>
</template>

<script>
	import UserInfoGrid from '../components/UserInfoGrid.vue'
	export default {
		components: {
			UserInfoGrid,
		},
		data() {
			return {
				user: {},
				device: {},
			}
		},

		async created() {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			console.log(this.user)
		},
		async mounted() {
			await this.$cmd.executeScript('GetDeviceInfo', async (error, result) => {
				if (error) {
					console.error('Error ejecutando script:', error)
				} else {
					console.log('Resultado del script:', result)
					for (let x of this.$env.project) {
						console.log(x)
						let res = await this.$rsDB(x.db)
							.select('SerialNumber, ArrivedSKU')
							.from('sfis_WorkTracking')
							.where(`SerialNumber = '${result.Serial}'`)
							.execute()
						if (res) {
							console.log(res)
							break
						}
					}
					this.device = result
					// Realizar acciones adicionales con el resultado aquí
				}
			})
		},
	}
</script>
