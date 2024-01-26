export default {
	database: {
		server: 'sqlprodisp.database.windows.net',
		user: 'sfis_test',
		password: 'Sf1s@R3ad_1st#2023prod',
	},
	localDB: {
		server: '192.168.0.6',
		user: 'rsuarez',
		password: 'isp2023#',
		table: 'npi_06_test_snresults',
	},

	project: [
		/* {
			db: 'SFisDB_DEV',
			id: 'HPRefurbish',
			url: 'https://sfiswebwebdev.azurewebsites.net/api',
		}, */
		{
			db: 'SfisDB',
			id: 'HPRefurbish',
			url: 'https://sfisprodisp.azurewebsites.net/api',
		},
		{
			db: 'Sfis_HP_RevenueDB',
			id: 'ISP-PC',
			url: 'https://sfis-hprevenue.azurewebsites.net/api',
		},
	],
	mongodb: {
		dev: 'http://localhost:4500/api',
		server: 'http://192.168.0.2:4500/api',
	},
	version: '1.0.0',
	github: {
		user: 'randywsuarez',
		repository: 'windowsTest',
	},
}
