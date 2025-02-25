export default {
	async fetchSystemInfo({ state, commit }) {
		if (state.systemInfo) {
			return state.systemInfo
		}

		if (state.systemInfoPromise) {
			return state.systemInfoPromise
		}

		commit('SET_LOADING', true) // ✅ Usamos mutación

		const promise = new Promise(async (resolve, reject) => {
			try {
				const info = await this._vm.$si() // Simulación de petición
				commit('SET_SYSTEM_INFO', info) // ✅ Mutación en lugar de modificar state directamente
				resolve(info)
			} catch (error) {
				reject(error)
			} finally {
				commit('SET_LOADING', false)
				commit('SET_SYSTEM_INFO_PROMISE', null)
			}
		})

		commit('SET_SYSTEM_INFO_PROMISE', promise)
		return promise
	},
}
