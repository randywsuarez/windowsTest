export default {
	database: {
		server: 'ctlsqlprod.database.windows.net',
		user: 'sfis_test',
		password: 'Sf1s@R3ad_1st#2023prod',
	},
	localDB: {
		server: '192.168.0.6',
		user: 'rsuarez',
		password: 'isp2023#',
		table: 'npi_06_test_snresults',
	},

	project: {
		db: 'CTLShopFloorDB_Prod',
		url: 'https://ctlshopfloorprod.azurewebsites.net/api',
	},

	mongodb: {
		server: 'http://10.20.0.2:4700/api',
		public: 'http://192.168.0.2:4700/api',
		dev: 'http://192.168.0.7:4400/api',
		local: 'http://localhost:4400/api',
	},
	version: '1.2.1',
	token: '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',
	github: {
		user: 'randywsuarez',
		repository: 'windowsTest',
	},
}
