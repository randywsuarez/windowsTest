const si = require('systeminformation')

async function safeGetData(func) {
	try {
		return await func()
	} catch (error) {
		console.error(`Error getting ${func.name} information:`, error)
		return null
	}
}

async function getSystemBiosBaseboard() {
	try {
		const results = await Promise.all([
			safeGetData(si.system),
			safeGetData(si.bios),
			safeGetData(si.baseboard),
		])

		return {
			system: results[0],
			bios: results[1],
			baseboard: results[2],
		}
	} catch (error) {
		console.error('Error getting system, BIOS, and baseboard information:', error)
		return null
	}
}

async function getSystemInfo() {
	try {
		const results = await Promise.all([
			safeGetData(si.chassis),
			safeGetData(si.uuid),
			safeGetData(si.versions),
			safeGetData(si.blockDevices),
			safeGetData(si.fsSize),
			safeGetData(si.networkInterfaces),
			safeGetData(si.audio),
			safeGetData(si.bluetoothDevices),
			safeGetData(si.wifiNetworks),
			safeGetData(si.wifiInterfaces),
		])

		return {
			chassis: results[0],
			uuid: results[1],
			versions: results[2],
			blockDevices: results[3],
			fsSize: results[4],
			networkInterfaces: results[5],
			audio: results[6],
			bluetooth: results[7],
			wifiNetworks: results[8],
			wifiInterfaces: results[9],
		}
	} catch (error) {
		console.error('Error getting system information:', error)
		return null
	}
}

async function getHardwareInfo() {
	try {
		const results = await Promise.all([
			safeGetData(si.cpu),
			safeGetData(si.mem),
			safeGetData(si.memLayout),
			safeGetData(si.graphics),
			safeGetData(si.diskLayout),
			safeGetData(si.osInfo),
		])

		return {
			cpu: results[0],
			mem: results[1],
			memLayout: results[2],
			graphics: results[3],
			diskLayout: results[4],
			osInfo: results[5],
		}
	} catch (error) {
		console.error('Error getting hardware information:', error)
		return null
	}
}

async function getSpecificInfo(key) {
	try {
		if (si[key]) {
			return await safeGetData(si[key])
		} else {
			throw new Error(`Invalid key: ${key}`)
		}
	} catch (error) {
		console.error(`Error getting specific information for ${key}:`, error)
		return null
	}
}

module.exports = ({ Vue }) => {
	// Prototype para obtener solo system, bios y baseboard
	Vue.prototype.$system = async function () {
		try {
			return await getSystemBiosBaseboard()
		} catch (error) {
			console.error('Error getting system, BIOS, and baseboard information:', error)
			return null
		}
	}

	// Prototype para obtener toda la información del sistema, excepto hardware
	Vue.prototype.$si = async function () {
		try {
			return await getSystemInfo()
		} catch (error) {
			console.error('Error getting system information:', error)
			return null
		}
	}

	// Prototype para obtener información de hardware
	Vue.prototype.$hardwareInfo = async function () {
		try {
			return await getHardwareInfo()
		} catch (error) {
			console.error('Error getting hardware information:', error)
			return null
		}
	}

	// Prototype para obtener información específica
	Vue.prototype.$getSpecificInfo = async function (key) {
		try {
			return await getSpecificInfo(key)
		} catch (error) {
			console.error(`Error getting specific information for ${key}:`, error)
			return null
		}
	}
}
