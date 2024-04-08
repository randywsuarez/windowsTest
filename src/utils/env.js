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
			admin: 'SfisAdminDB_DEV',
			id: 'HPRefurbish',
			url: 'https://dev-sfis.ispt.app/api',
		}, */
		{
			db: 'SfisDB',
			admin: 'SfisAdminDB',
			id: 'HPRefurbish',
			url: 'https://sfis.ispt.app/api',
		},
		{
			db: 'Sfis_HP_RevenueDB',
			admin: 'Sfis_HP_RevenueAdminDB',
			id: 'ISP-PC',
			url: 'https://shared-revenue.ispt.app/api',
		},
	],
	mongodb: {
		dev: 'http://localhost:4500/api',
		server: 'http://192.168.0.2:4500/api',
	},
	version: '1.0.11',
	token: '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',
	github: {
		user: 'randywsuarez',
		repository: 'windowsTest',
	},
}
