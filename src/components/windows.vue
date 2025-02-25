<template>
	<div class="col-12 col-md-5">
		<q-card id="windows">
			<q-card-section>
				<div class="text-h6">Windows License Details</div>
			</q-card-section>
			<q-separator />
			<q-card-section>
				<q-list dense>
					<q-item
						v-for="(item, index) in licenseDetails"
						:key="index"
						clickable
						v-ripple
						:class="index % 2 === 0 ? 'bg-grey-2' : ''"
					>
						<q-item-section avatar>
							<q-icon :name="item.icon" color="primary" />
						</q-item-section>
						<q-item-section>
							<q-item-label caption>{{ item.label }}</q-item-label>
							<q-item-label>{{ item.value }}</q-item-label>
						</q-item-section>
					</q-item>
				</q-list>
			</q-card-section>
		</q-card>
	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import html2canvas from 'html2canvas'

	export default {
		data() {
			return {
				select: {},
				statusNotificaction: true,
				actived: false,
				fail: false,
			}
		},
		computed: {
			...mapState('information', ['infoServer', 'win']),

			licenseDetails() {
				return [
					{
						label: 'Operating System',
						value: this.win.os,
						icon: 'computer',
					},
					{ label: 'License Details', value: this.win.licenseDetails, icon: 'verified' },
					{
						label: 'Original Product Key',
						value: this.win?.oldKeyWin ? this.win.oldKeyWin : this.win.keyWindows,
						icon: 'vpn_key',
					},
					{
						label: 'New Product Key',
						value: this.win?.oldKeyWin ? this.win.keyWindows : '',
						icon: 'vpn_key',
					},
					{ label: 'Edition', value: this.win.edition, icon: 'window' },
					{
						label: 'Activation',
						value: this.win.activate == 1 ? 'YES' : 'NO',
						icon: 'lock_open',
					},
				]
			},
		},
		methods: {
			...mapMutations('information', ['SET_WIN']),

			async verifyDPK() {
				try {
					const options = {
						method: 'POST',
						headers: {
							tenant: this.infoServer.validateUnit.TenantName,
							'Content-Type': 'application/json',
							Authorization: `Bearer ${this.select.authToken}`,
						},
						body: JSON.stringify({
							SerialNumber: this.infoServer.validateUnit.SerialNumber,
							ExistingProductKey: this.win.keyWindows,
							ExistingProductEdition: this.win.edition,
						}),
					}

					let result = await this.$db.funcAdmin('modules/ispt/verifyDPK', {
						options,
						Project: this.infoServer.validateUnit.TenantId,
						System: this.$env.project.url,
						data: options.body,
					})

					console.log('Result: ', result)

					if (result.error && result.errorMessage === 'No available replacement keys') {
						await this.$db.funcAdmin('modules/ispt/issueReport', {
							title: result.errorMessage,
							message: `DPK for ${this.win.edition} is not available.`,
						})
						this.$q
							.dialog({
								title: 'Alert<em>!</em>',
								message: `<em>Error: </em> <span class="text-red">${result.errorMessage}.</span> <strong> Talk to your supervisor.</strong>`,
								html: true,
								persistent: true,
							})
							.onOk(() => this.verifyDPK())
					}

					return result
				} catch (error) {
					console.error('Error in verifyDPK:', error)
					return { error: true, errorMessage: error.message }
				}
			},

			async statusDPK() {
				try {
					const options = {
						method: 'POST',
						headers: {
							tenant: this.infoServer.validateUnit.TenantName,
							'Content-Type': 'application/json',
							Authorization: `Bearer ${this.select.authToken}`,
						},
						body: JSON.stringify({
							SerialNumber: this.infoServer.validateUnit.SerialNumber,
							NewProductKey: this.win.keyWindows,
						}),
					}

					return await this.$db.funcAdmin('modules/ispt/statusDPK', {
						options,
						Project: this.infoServer.validateUnit.TenantName,
						System: this.$env.project.url,
						data: options.body,
					})
				} catch (error) {
					console.error('Error in statusDPK:', error)
				}
			},

			async failDPK() {
				try {
					const options = {
						method: 'POST',
						headers: {
							tenant: this.infoServer.validateUnit.TenantName,
							'Content-Type': 'application/json',
							Authorization: `Bearer ${this.select.authToken}`,
						},
						body: JSON.stringify({
							SerialNumber: this.infoServer.validateUnit.SerialNumber,
							dpk: this.win.keyWindows,
						}),
					}

					return await this.$db.funcAdmin('modules/ispt/failDPK', {
						options,
						Project: this.infoServer.validateUnit.TenantName,
						System: this.$env.project.url,
						data: options.body,
					})
				} catch (error) {
					console.error('Error in failDPK:', error)
				}
			},

			async captureStatus(status) {
				const element = document.getElementById('windows')
				const canvas = await html2canvas(element)
				const imageData = canvas.toDataURL('image/png')

				const result = {
					base64: imageData,
					ext: 'png',
					type: 'activation',
					status: status === 'pass',
					message: `Windows Activation Test ${status.toUpperCase()}`,
				}

				localStorage.setItem('activationTestState', JSON.stringify(result))
				this.$emit('input', result)
			},
		},
		async mounted() {
			try {
				this.select = (await this.$rsNeDB('credenciales').find())[0]
				console.log('--- Starting Windows Activation Test ---')

				this.$q.loading.show({
					message:
						'Obtaining <b>DPK</b> status.<br/><span class="text-orange text-weight-bold">Hang on...</span>',
				})
				this.$q.loading.hide()

				if (!this.win.hasOwnProperty('keyWindows') || this.win.keyWindows === 'Key not found') {
					if (this.statusNotificaction) {
						await this.$db.funcAdmin('modules/ispt/issueReport', {
							title: 'No DPK',
							message: `DPK for ${this.infoServer.validateUnit.SerialNumber} is not available.`,
						})
						this.$q
							.dialog({
								title: 'Alert<em>!</em>',
								message: `<em>Error: </em> <span class="text-red">the device needs DPK.</span> <strong> Talk to your supervisor.</strong>`,
								html: true,
								persistent: true,
							})
							.onOk(() => {
								this.statusNotificaction = false
								this.testWindows()
							})
					}
				}

				// Verificar si hay DPK
				if (this.infoServer.infoTest.DPK) {
					console.log('DPK Found: ', this.infoServer.infoTest.DPK)

					let nDPK = await this.verifyDPK()
					console.log('DPK Verification Result: ', nDPK)

					if (!nDPK.error && nDPK.needsNewProductKey) {
						console.log('DPK requires replacement product key.')

						let sDPK = await this.statusDPK()
						console.log('DPK Status: ', sDPK)
					}

					this.actived = true
					this.SET_WIN({ ...this.win, activate: 1 })
					await this.captureStatus('pass')
				}
			} catch (error) {
				console.error('Error in mounted:', error)
			}
		},
	}
</script>
