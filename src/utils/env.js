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
		server: 'http://10.0.0.2:4500/api',
		public: 'http://47.190.184.6:4900/api',
		dev: 'http://192.168.0.7:4400/api',
		local: 'http://localhost:4400/api',
	},
	version: '1.1.7',
	token: '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',
	github: {
		user: 'randywsuarez',
		repository: 'windowsTest',
	},
}
