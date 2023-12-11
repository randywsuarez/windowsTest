export default {
	database: {
		server: 'sqlprodisp.database.windows.net',
		user: 'sfis_test',
		password: 'Sf1s@R3ad_1st#2023prod',
	},
	project: [
		{
			db: 'SFisDB_DEV',
			id: 'HPRefurbish',
			url: 'https://sfiswebwebdev.azurewebsites.net/api/APP',
		},
		{
			db: 'SfisDB',
			id: 'HPRefurbish',
			url: 'https://sfisprodisp.azurewebsites.net/api/APP',
		},
		{
			db: 'Sfis_HP_RevenueDB',
			id: 'ISP-PC',
			url: 'https://sfis-hprevenue.azurewebsites.net/api/APP',
		},
	],
	mongodb: {
		dev: 'http://localhost:4300/api',
		server: 'http://192.168.0.9:4300/api',
	},
}
