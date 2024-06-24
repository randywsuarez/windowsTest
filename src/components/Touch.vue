// Touch.vue
<template>
	<div>
		<q-btn @click="enterFullScreen" label="Enter Full Screen" />
	</div>
</template>

<script>
	export default {
		name: 'Touch',
		methods: {
			enterFullScreen() {
				if (document.documentElement.requestFullscreen) {
					document.documentElement.requestFullscreen()
				} else if (document.documentElement.mozRequestFullScreen) {
					// Firefox
					document.documentElement.mozRequestFullScreen()
				} else if (document.documentElement.webkitRequestFullscreen) {
					// Chrome, Safari and Opera
					document.documentElement.webkitRequestFullscreen()
				} else if (document.documentElement.msRequestFullscreen) {
					// IE/Edge
					document.documentElement.msRequestFullscreen()
				}
			},
		},
	}
</script>
