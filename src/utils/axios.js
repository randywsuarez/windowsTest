import axios from 'axios'
import { Notify } from 'quasar'
import { LocalStorage } from 'quasar'
import env from '../utils/env'

let instance = axios.create({
	// baseURL: 'http://localhost:3000/api/',
	baseURL: env.mongodb.server,
	//baseURL: env.dev,
	// timeout: 1000,
	// headers: {'X-Custom-Header': 'foobar'}
})

instance.interceptors.response.use(
	function (response) {
		console.log('paso')
		// Do something with response data
		// console.log(response)
		return response.data
	},
	function (error) {
		// Do something with response error
		//

		var token = LocalStorage.getItem('token')
		if (token) {
			if (!config.headers) config.headers = {}
			if (token) config.headers['access-token'] = token
		}

		var data = error

		// if(error.response.status == 422)
		// data = error.response.data.error

		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			//console.log(error.response.data);

			if (error.response.status == 401) {
				// LocalStorage.remove('user')
				// LocalStorage.remove('token')
				// window.location.reload()
				return Promise.reject(data.response.data.error)
			}

			data = error.response.data.error
			Notify.create(error.response.data.error.message)
			//console.log(error.response.status);
			//console.log(error.response.headers);
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			//console.log(error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			//console.log('Error', error.message);
		}
		//console.log(error.config);

		return Promise.reject(data)
	}
)

instance.interceptors.request.use(
	function (config) {
		// Do something before request is sent
		console.log(config)
		var token = LocalStorage.getItem('token')
		if (token) {
			if (!config.params) config.params = {}
			config.params.access_token = token
		}
		console.log('config: ', config)
		let conf = LocalStorage.getItem('empresa')
		if (conf) config.params['conf'] = conf

		/* var selected = LocalStorage.getItem('selected')
		if (selected) {
			if (!config.params.conf) config.params.conf = {}
			config.params.conf['company'] = selected
		}

		var user = LocalStorage.getItem('user')
		if (user) {
			if (!config.params.conf) config.params.conf = {}
			//config.params.conf.company = user.__company__
			config.params.conf['parent_company'] = user.parent_company
		} */

		return config
	},
	function (error) {
		// Do something with request error
		return Promise.reject(error)
	}
)

export default instance
