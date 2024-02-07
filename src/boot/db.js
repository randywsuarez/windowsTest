import axios from '../utils/axios'

import { Notify, Dialog, Loading } from 'quasar'
import io from 'socket.io-client'
import env from '../utils/env'

export default ({ Vue, router }) => {
	class DB {
		constructor(collection, doc) {
			this.c = collection
			this.d = doc
			this.snapshot = false
			this.opts = {
				all_data: false,
			}
			this.event_key = null
			this.vue = new Vue({
				data() {
					return {
						opts: {},
					}
				},
			})

			this.vue.$watch('opts', (v) => {}, { deep: true })
		}

		get path() {
			return this.c + (this.d ? '/' + this.d : '')
		}

		doc(doc) {
			this.d = doc
			return this
		}

		exp(val) {
			this.opts.exp = val
			this.vue.opts.exp = val
			return this
		}
		fields(val) {
			this.opts.fields = val
			this.vue.opts.fields = val
			return this
		}

		limit(val) {
			this.opts.limit = val
			this.vue.opts.limit = val
			return this
		}

		page(val) {
			this.opts.page = val
			return this
		}

		all_data() {
			this.opts.all_data = true
			return this
		}

		admin() {
			this.opts.admin = true
			return this
		}

		paginate(val) {
			this.opts.page = val
			this.opts.with_pagination = true
			if (!this.opts.limit) this.opts.limit = 10
			return this
		}

		orderBy(name, dir) {
			this.opts.sort = {
				[name]: dir.toLowerCase() === 'asc' ? 1 : -1,
			}
			return this
		}

		sort(opts) {
			this.opts.sort = opts
			return this
		}

		only_parent() {
			this.opts.only_parent = true
			return this
		}

		conditions(cond) {
			this.opts.conditions = cond
			return this
		}

		only(fields) {
			this.opts.only = fields
			return this
		}

		get() {
			return new Promise((resolve, reject) => {
				// socket.emit('get', this.path, this.opts, data => {
				// 	this.event_key = data.event_key
				//      	resolve(this.d ? data.docs : { docs: data.docs })
				//  	})

				if (!this.opts.all_data) delete this.opts.all_data

				if (!this.opts.only_parent) delete this.opts.only_parent

				axios({
					method: 'post',
					url: 'get',
					params: {
						opts: this.opts,
						path: this.path,
					},
					/* headers: {
						...(this.opts.all_data ? { all_data: true } : {}),
						...(this.opts.only_parent ? { only_parent: true } : {}),
					}, */
				})
					.then((data) => {
						if (data.docs) resolve(this.d ? data.docs : data.docs)
						else resolve({})
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		count() {
			return new Promise((resolve) => {
				axios({
					method: 'post',
					url: 'count',
					params: {
						opts: this.opts,
						path: this.path,
					},
				})
					.then((data) => {
						resolve(data.docs)
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		set(data) {
			return new Promise((resolve) => {
				axios({
					method: 'post',
					url: 'set',
					params: {
						opts: this.opts,
						path: this.path,
					},
					data,
				})
					.then((res) => {
						resolve(res)
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		add(data) {
			return new Promise((resolve) => {
				axios({
					method: 'post',
					url: 'add',
					params: {
						opts: this.opts,
						path: this.path,
					},
					data,
				})
					.then((res) => {
						resolve(res)
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		update(data) {
			return new Promise((resolve) => {
				axios({
					method: 'post',
					url: 'update',
					params: {
						path: this.path,
					},
					data,
				})
					.then((res) => {
						resolve(res)
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		delete() {
			return new Promise((resolve, reject) => {
				axios({
					method: 'post',
					url: 'delete',
					params: {
						path: this.path,
						opts: this.opts,
					},
				})
					.then((res) => {
						resolve(res)
					})
					.catch((e) => {
						if (e.data.error == 'token')
							Dialog.create({
								title: 'Error',
								message: 'Error con el token',
								ok: true,
								color: 'negative',
							}).then(() => {
								localStorage.clear()
								router.go('/login')
							})
						else {
							Notify.create(e.data)
						}
					})
			})
		}

		returnData(data) {}

		onSnapshot(fn) {
			console.log('connecting')

			var vm = this

			function returnData(data) {
				fn(data)
			}

			this.snapshot = fn

			this.get().then((val) => {
				fn(val)
				//console.log('connecting event', this.d ? this.path : (this.c + '_' + (this.event_key || this.event_key === 0 ? this.event_key : '')))
				var s = socket.on(
					this.d
						? this.path
						: this.c + '_' + (this.event_key || this.event_key === 0 ? this.event_key : ''),
					returnData
				)
				socket.on('reconnect', (attemp) => {
					//console.log('reconnect', attemp)
					if (!this.disconnect) {
						//console.log('reconnecting')
						this.onSnapshot(fn)
					}
				})
				//console.log('socket', s)
			})

			var vm = this

			return function () {
				vm.disconnect = true
				socket.removeListener(
					vm.d ? vm.path : vm.c + '_' + (vm.event_key || vm.event_key === 0 ? vm.event_key : ''),
					returnData
				)
				// socket.removeAllListeners(vm.d ? vm.path : (vm.c + '_' + (vm.event_key || '')))
			}
		}

		offSnapshot() {}
	}
	Vue.prototype.$db = {
		collection(collection) {
			return new DB(collection)
		},
		doc(doc) {
			var path = doc.split('/')
			return new DB(path[0], path[1])
		},
		functions(path, data, admin = false) {
			return new Promise((resolve, reject) => {
				try {
					axios({
						method: 'post',
						url: 'function',
						params: {
							path,
							opts: admin ? { admin } : {},
						},
						data: {
							data,
						},
					})
						.then((res) => {
							if (res.result) resolve(res.data)
							else {
								if (res.data.error == 'token')
									Dialog.create({
										title: 'Error',
										...res.data,
										ok: true,
										color: 'negative',
									}).then(() => {
										router.go('/login')
									})
								else {
									reject(new Error(res.data.message))
									Notify.create(res.data)
								}
							}
						})
						.catch((e) => {
							if (e.data.error == 'token')
								Dialog.create({
									title: 'Error',
									message: e.data.message,
									ok: true,
									color: 'negative',
								}).then(() => {
									// localStorage.clear()
									router.go('/login')
								})
							/* reject(new Error(e))
							router.go('/login') */
						})
				} catch (e) {
					reject(new Error(e))
				}
			})
		},
		funcAdmin(path, data) {
			return new Promise((resolve, reject) => {
				try {
					axios({
						method: 'post',
						url: 'funcAdmin',
						params: {
							path,
						},
						data: {
							data,
						},
					})
						.then((res) => {
							if (res.result) resolve(res.data)
							else {
								console.log(res)
								Dialog.create({
									title: 'Error',
									message: res.data,
									ok: true,
									color: 'negative',
								}).then(() => {
									//router.go('/login')
								})
								reject(new Error(res.data))
							}
						})
						.catch((e) => {
							Loading.hide()
							if (e.data.error == 'token')
								Dialog.create({
									title: 'Error',
									message: e.data.message,
									ok: true,
									color: 'negative',
								}).then(() => {
									// localStorage.clear()
									router.go('/login')
								})
							else {
								Notify.create(e.data)
							}
							/* reject(new Error(e))
							router.go('/login') */
						})
				} catch (e) {
					reject(new Error(e))
				}
			})
		},
		auth(path, data) {
			return new Promise((resolve, reject) => {
				console.log(path, data)
				axios({
					method: 'post',
					url: 'auth',
					params: {
						path,
					},
					data: {
						data,
					},
				}).then((res) => {
					if (res.result) resolve(res.data)
					else {
						reject(res.data)
						Notify.create(res.data)
					}
				})
			})
		},
		//socket: io.connect(env.mongodb.server),
	}
}
