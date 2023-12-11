<template>
	<q-page class="" style="padding-top: 10px">
		<user-info-grid
			:username="user.usuario"
			:project="project.id"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
		/>
		<!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    > -->

		<Reproductor @respuesta="sound = $event" :autoPlay="true" />
		<p>Respuesta del Reproductor: {{ sound }}</p>
	</q-page>
</template>

<script>
	import UserInfoGrid from '../components/UserInfoGrid.vue'
	import Reproductor from '../components/soundTest.vue'
	export default {
		components: {
			UserInfoGrid,
			Reproductor,
		},
		data() {
			return {
				user: {},
				device: {},
				test: {},
				project: {},
				sound: false,
			}
		},
		methods: {
			DateTime() {
				const options = { method: 'GET' }
				return fetch('https://worldtimeapi.org/api/timezone/America/Chicago', options)
					.then((response) => response.json())
					.then((r) => {
						console.log(r)
						const date = r.datetime.split('T')[0]
						const time = r.datetime.split('T')[1]
						return {
							date: date,
							time: time,
							complete: r.datatime,
						}
					})
					.catch((err) => console.error(err))
			},
		},
		async beforeCreate() {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			console.log(this.user)
		},
		async mounted() {
			await this.$cmd.executeScript('GetDeviceInfo', async (error, result) => {
				if (error) {
					console.error('Error ejecutando script:', error)
				} else {
					let res = ''
					console.log('Resultado del script:', result)
					for (let x of this.$env.project) {
						let u = await this.$rsNeDB('credenciales').findOne({ tenant: x.id })
						console.log(u.tenant, x.db)
						res = await this.$rsDB(x.db)
							.select('SerialNumber, ArrivedSKU, StationID')
							.from('sfis_WorkTracking')
							.where(`SerialNumber = '${result.Serial}'`)
							.execute()
						if (res.length) {
							this.project['id'] = x.id
							this.project['db'] = x.db
							this.project['operator'] = u.id
							break
						}
					}
					if (!this.project.hasOwnProperty('id')) return (test['Serial'] = `SN ID Check FAIL`)
					console.log(res, res.length)
					if (!res[0].StationID == 15) return
					this.device = result
					// Realizar acciones adicionales con el resultado aquí
					let datetime = await this.DateTime()
					this.test['Date'] = datetime.date
					this.test['startTime'] = datetime.time
					this.test['Serial'] = `SN ID Check PASS, SNID: ${this.device.Serial}`
					if (this.device.SKU == res[0].ArrivedSKU)
						this.test['Model'] = `Model (SKU ID) Check PASS, SKUID: ${this.device.SKU}`
					this.test['Description'] = `Product Description: ${this.device.Description}`

					console.log(this.test)
				}
			})
		},
	}
</script>
