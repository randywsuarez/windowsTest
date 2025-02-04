export default {
	async fetchSystemInfo({ state, commit }) {
		// Si ya hay datos, devolverlos directamente
		if (state.systemInfo) {
			return state.systemInfo
		}

		// Si ya hay una promesa en curso, retornarla (esperar la resolución)
		if (state.systemInfoPromise) {
			return state.systemInfoPromise
		}

		// Marcar que estamos cargando
		commit('SET_LOADING', true)

		// Crear y almacenar la promesa
		const promise = new Promise(async (resolve, reject) => {
			try {
				const info = await this._vm.$si() // Simulación de petición
				commit('SET_SYSTEM_INFO', info)
				resolve(info)
			} catch (error) {
				reject(error)
			} finally {
				commit('SET_LOADING', false)
				commit('SET_SYSTEM_INFO_PROMISE', null) // Limpiar la promesa
			}
		})

		commit('SET_SYSTEM_INFO_PROMISE', promise)
		return promise
	},
}
