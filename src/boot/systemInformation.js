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
			safeGetData(si.osInfo),
			safeGetData(si.uuid),
			safeGetData(si.versions),
			safeGetData(si.cpu),
			safeGetData(si.mem),
			safeGetData(si.memLayout),
			safeGetData(si.battery),
			safeGetData(si.graphics),
			safeGetData(si.diskLayout),
			safeGetData(si.blockDevices),
			safeGetData(si.fsSize),
			safeGetData(si.fsStats),
			safeGetData(si.networkInterfaces),
			safeGetData(si.audio),
			safeGetData(si.bluetoothDevices),
		])

		return {
			chassis: results[0],
			osInfo: results[1],
			uuid: results[2],
			versions: results[3],
			cpu: results[4],
			mem: results[5],
			memLayout: results[6],
			battery: results[7],
			graphics: results[8],
			diskLayout: results[9],
			blockDevices: results[10],
			fsSize: results[11],
			fsStats: results[12],
			networkInterfaces: results[13],
			audio: results[14],
			bluetooth: results[15],
		}
	} catch (error) {
		console.error('Error getting system information:', error)
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

	// Prototype para obtener toda la información del sistema, excepto system, bios y baseboard
	Vue.prototype.$si = async function () {
		try {
			const systemInfo = await getSystemInfo()
			return systemInfo
		} catch (error) {
			console.error('Error getting system information:', error)
			return null
		}
	}
}
