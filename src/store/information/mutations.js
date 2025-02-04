export default {
	SET_SYSTEM_INFO(state, info) {
		state.systemInfo = info
	},
	SET_SYSTEM_INFO_PROMISE(state, promise) {
		state.systemInfoPromise = promise
	},
	SET_LOADING(state, loading) {
		state.loading = loading
	},
}
