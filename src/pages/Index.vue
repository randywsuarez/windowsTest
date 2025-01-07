<template>
	<div class="q-pa-md">
		<q-btn label="Reset" push color="white" text-color="primary" @click="reset" class="q-mb-md" v />
		<title>Components Test</title>

		<q-stepper v-model="step" header-nav ref="stepper" color="green" animated>
			<q-step :name="1" title="Keyboard" icon="keyboard" :done="stepTest.Keyboard">
				<keyboard v-model="test.keyboard" />

				<q-stepper-navigation class="row justify-between q-pt-md">
					<q-btn
						:disable="!(test.keyboard.status == true)"
						@click="
							() => {
								stepTest.Keyboard = true
								step = 2
							}
						"
						color="primary"
						label="Continue"
					/>
				</q-stepper-navigation>
			</q-step>

			<q-step :name="2" title="Mouse / MousePad" icon="mouse" :done="stepTest.mouse">
				<mouse v-model="test.mouse" />

				<q-stepper-navigation class="row justify-between q-pt-md">
					<q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
					<q-btn
						:disable="!(test.mouse.status == true)"
						@click="
							() => {
								stepTest.mouse = true
								step = 3
							}
						"
						color="primary"
						label="Continue"
					/>
				</q-stepper-navigation>
			</q-step>
			<q-step :name="3" title="Mic" icon="mouse" :done="stepTest.mic">
				<mic v-model="test.mic" />

				<q-stepper-navigation class="row justify-between q-pt-md">
					<q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
					<q-btn
						:disable="!(test.mic.status == true)"
						@click="
							() => {
								stepTest.mic = true
								step = 4
							}
						"
						color="primary"
						label="Continue"
					/>
				</q-stepper-navigation>
			</q-step>

			<q-step :name="20" title="Create an ad" icon="add_comment" :done="stepTest.mic">
				<mic v-model="test.mic" />

				<q-stepper-navigation>
					<q-btn color="primary" @click="done3 = true" label="Finish" />
					<q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
				</q-stepper-navigation>
			</q-step>
		</q-stepper>

		<pre>{{ test }}</pre>
		<!-- <q-img :src="test.keyboard.image.base64" spinner-color="primary" spinner-size="82px" /> -->
	</div>
</template>

<script>
	import Keyboard from '../components/Keyboard.vue'
	import Mouse from '../components/Mouse.vue'
	import Mic from '../components/Mic.vue'
	export default {
		components: {
			Keyboard,
			Mouse,
			Mic,
		},
		data() {
			return {
				step: 1,
				stepTest: {
					Keyboard: null,
					mouse: null,
					mic: null,
				},
				test: {
					keyboard: {},
					mouse: {},
					mic: {},
				},
				done1: false,
				done2: false,
				done3: false,
			}
		},

		methods: {
			reset() {
				this.done1 = false
				this.done2 = false
				this.done3 = false
				this.step = 2
			},
		},
	}
</script>
<style scoped>
	pre {
		white-space: pre-wrap; /* Permite el salto de línea dentro de la etiqueta <pre> */
		word-wrap: break-word; /* Asegura que las palabras largas se dividan para ajustarse */
		max-width: 400px; /* Limita el ancho del bloque de texto */
		border: 1px solid #ccc;
		padding: 10px;
		background-color: #f9f9f9;
	}
</style>
