export default function () {
	return {
		informationBios: {},
		advancedBios: {},
		systemInformation: {},
		type: '',
		hardwareInfo: {},
		infoServer: {},
		win: {},
		TocuhScreen: false,
		Webcam: 'SI',
		typeCTO: false,
		GPU: true,
		systemInfoPromise: null,
		systemInfo: null, // Datos obtenidos
		systemInfoPromise: null, // Guardará la promesa en curso
		loading: false, // Estado de carga global
	}
}
