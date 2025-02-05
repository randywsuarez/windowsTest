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
	import { mapState } from 'vuex'
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
			...mapState(['infoServer', 'win']),
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
						value: `${this.win?.oldKeyWin ? this.win.oldKeyWin : this.win.keyWindows}`,
						icon: 'vpn_key',
					},
					{
						label: 'New Product Key',
						value: `${this.win?.oldKeyWin ? this.win.keyWindows : ''}`,
						icon: 'vpn_key',
					},
					{ label: 'Edition', value: this.win.edition, icon: 'window' },
					{
						label: 'Activation',
						value: `${this.win.activate == 1 ? 'YES' : 'NO'}`,
						icon: 'lock_open',
					},
				]
			},
		},
		methods: {
			async verifyDPK() {
				const options = {
					method: 'POST',
					headers: {
						tenant: `${this.infoServer.validateUnit.TenantName}`,
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.select.authToken}`,
					},
					body: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						ExistingProductKey: this.win.keyWindows,
						ExistingProductEdition: this.win.edition,
					},
				}
				let result = await this.$db.funcAdmin('modules/ispt/verifyDPK', {
					options,
					Project: this.infoServer.validateUnit.TenantId,
					System: this.$env.project.url,
					data: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						ExistingProductKey: this.win.keyWindows,
						ExistingProductEdition: this.win.edition,
					},
				})
				console.log('Result: ', result)
				if (result.error && result.errorMessage == 'No available replacement keys') {
					this.$db.funcAdmin('modules/ispt/issueReport', {
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
						.onOk(async () => {
							await this.verifyDPK()
						})
				}
				return result
			},
			async statusDPK(r) {
				const options = {
					method: 'POST',
					headers: {
						tenant: `${this.infoServer.validateUnit.TenantName}`,
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.select.authToken}`,
					},
					body: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						NewProductKey: this.win.keyWindows,
					},
				}
				return await this.$db.funcAdmin('modules/ispt/statusDPK', {
					options,
					Project: this.infoServer.validateUnit.TenantName,
					System: this.$env.project.url,
					data: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						NewProductKey: this.win.keyWindows,
					},
				})
			},
			async failDPK(r) {
				const options = {
					method: 'POST',
					headers: {
						tenant: `${this.infoServer.validateUnit.TenantName}`,
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.select.authToken}`,
					},
					body: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						dpk: this.win.keyWindows,
					},
				}
				return await this.$db.funcAdmin('modules/ispt/failDPK', {
					options,
					Project: this.infoServer.validateUnit.TenantName,
					System: this.$env.project.url,
					data: {
						SerialNumber: this.infoServer.validateUnit.SerialNumber,
						dpk: this.win.keyWindows,
					},
				})
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
					message: `Windows Activation Test PASS`,
				}
				localStorage.setItem('activationTestState', JSON.stringify(result))
				this.$emit('input', result)
			},
		},
		async mounted() {
			this.select = (await this.$rsNeDB('credenciales').find())[0]
			console.log('--- Starting Windows Activation Test ---')

			// Iniciando el proceso con loading
			this.$q.loading.show({
				message:
					'Obtaining <b>DPK</b> status.<br/><span class="text-orange text-weight-bold">Hang on...</span>',
			})
			this.$q.loading.hide()
			if (!this.win.hasOwnProperty('keyWindows') || this.win.keyWindows == 'Key not found') {
				if (this.statusNotificaction) {
					this.$db.funcAdmin('modules/ispt/issueReport', {
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
						.onOk(async () => {
							this.statusNotificaction = false
							await this.testWindows()
						})
				}
			}

			// Verificar si hay DPK
			if (this.infoServer.infoTest.DPK) {
				console.log('DPK Found: ', this.infoServer.infoTest.DPK)

				let nDPK = await this.verifyDPK()
				console.log('DPK Verification Result: ', nDPK)
				this.actived = true
				// Manejo de errores
				if (nDPK.error) {
					console.error('DPK Error: ', nDPK.errorMessage)
					setTimeout(() => {
						this.$q.notify({
							type: 'negative',
							message: nDPK.errorMessage,
						})
					}, 3000)
					return
				}

				// Si necesita una nueva clave de producto
				if (nDPK.needsNewProductKey) {
					console.log('DPK requires replacement product key.')

					this.$q.loading.show({
						message:
							'Deactivating the active <b>DPK</b><br/><span class="text-orange text-weight-bold">Hang on...</span>',
					})
					let dWin = await this.$db.funcAdmin('modules/powershell/desactivateWindows')
					let aWin = await this.$db.funcAdmin('modules/powershell/activateWindows')
					await this.$cmd.executeScriptCode(dWin)
					let ndpk = aWin
						.replace('$dpk', nDPK.replacementProductKey)
						.replace('$mode', this.infoServer.infoTest.DPKMode)
					console.log('New DPK Command: ', ndpk)

					this.$q.loading.hide()
					this.$q.loading.show({
						message:
							'Activating <b>Windows</b><br/><span class="text-orange text-weight-bold">Hang on...</span>',
					})

					let iny = await this.$cmd.executeScriptCode(ndpk)
					console.log('Activation Result: ', iny)

					this.$q.loading.hide()

					// Si hay error al activar
					if (iny.error) {
						console.error('Activation Error: ', iny.message)

						this.$q
							.dialog({
								title: 'Alert<em>!</em>',
								message: `<em>The following DPK </em> <span class="text-red">${nDPK.replacementProductKey}</span> <strong> is invalid</strong>`,
								html: true,
							})
							.onOk(async () => {
								this.$q.loading.show()
								let retryKey =
									this.win.keyWindows != 'No license found'
										? this.win.keyWindows
										: localStorage.getItem('dpk')

								let retryNdpk = aWin
									.replace('$dpk', retryKey)
									.replace('$mode', this.infoServer.infoTest.DPKMode)

								console.log('Retry Activation Command: ', retryNdpk)

								await this.$cmd.executeScriptCode(retryNdpk)
								this.$q.loading.hide()

								this.testWindows()

								if (this.infoServer.infoTest.DPKRetry) {
									this.fail = await this.failDPK()
									console.log('Failed DPK Retry: ', this.win.fail)
								}
							})
					} else {
						console.log('Activation Successful: ', iny.message)
						this.actived = true
						this.win.oldKeyWin = this.win.keyWindows
						this.win.keyWindows = iny.productKeyUsed
						this.win.licenseDetails = iny.message
						this.$store.state.win = this.win
						if (this.actived) await this.captureStatus('pass')
						let sDPK = await this.statusDPK()
						console.log('DPK Status: ', sDPK)
					}
				} else {
					console.log('DPK is not required.')
					this.$store.state.win = this.win
					this.actived = true
					if (this.actived) await this.captureStatus('pass')
				}
			}
		},
	}
</script>
