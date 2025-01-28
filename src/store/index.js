import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import information from './information'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
	const Store = new Vuex.Store({
		modules: {
			information,
		},
		plugins: [
			createPersistedState({
				key: 'myApp', // Nombre de la clave en localStorage
				storage: window.localStorage, // Cambiar a sessionStorage si es necesario
			}),
		],

		// enable strict mode (adds overhead!)
		// for dev mode only
		strict: process.env.DEBUGGING,
	})

	return Store
}
