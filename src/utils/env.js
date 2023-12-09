export default {
  database: {
    server: "sqlprodisp.database.windows.net",
    user: "sfis_test",
    password: "Sf1s@R3ad_1st#2023prod",
  },
  project: [
    {
      id: "HPRefurbish",
      url: "https://sfiswebwebdev.azurewebsites.net/api/APP/",
    },
    /* {
        id: "ISP-PC",
        url: "https://sfiswebwebdev.azurewebsites.net/api/APP/",
      }, */
  ],
  mongodb: {
    dev: "http://localhost:4300/api",
    server: "http://192.168.0.9:4300/api",
  },
};
