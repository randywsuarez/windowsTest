const si = require('systeminformation')
const fs = require('fs')

async function safeGetData(func) {
	try {
		return await func()
	} catch (error) {
		console.error(`Error getting ${func.name} information:`, error)
		return null
	}
}

async function getSystemInfo() {
	try {
		const results = await Promise.all([
			safeGetData(si.system),
			safeGetData(si.bios),
			safeGetData(si.baseboard),
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
			system: results[0],
			bios: results[1],
			baseboard: results[2],
			chassis: results[3],
			osInfo: results[4],
			uuid: results[5],
			versions: results[6],
			cpu: results[7],
			mem: results[8],
			memLayout: results[9],
			battery: results[10],
			graphics: results[11],
			diskLayout: results[12],
			blockDevices: results[13],
			fsSize: results[14],
			fsStats: results[15],
			networkInterfaces: results[16],
			audio: results[17],
			bluetooth: results[18],
		}
	} catch (error) {
		console.error('Error getting system information:', error)
		return null
	}
}

module.exports = ({ Vue }) => {
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
