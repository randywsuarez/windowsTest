// src/boot/rsNeDB.js

import Datastore from "nedb-promises";
import path from "path";
import { remote } from "electron";

export default async ({ app, Vue }) => {
  class RsNeDB {
    constructor(databaseName) {
      const dbPath = path.join(
        __dirname,
        "..", // Ajusta la ruta según la estructura de tus carpetas
        "data",
        `${databaseName}.db`
      );

      // Utiliza 'new' para crear una instancia de Datastore
      this.db = new Datastore({
        filename: dbPath,
        autoload: true,
      });
    }

    async find(query) {
      return this.db.find(query);
    }

    async findOne(query) {
      return this.db.findOne(query);
    }

    async insert(doc) {
      return this.db.insert(doc);
    }

    async update(query, updateQuery, options) {
      return this.db.update(query, updateQuery, options);
    }

    async remove(query, options) {
      return this.db.remove(query, options);
    }
  }

  // Agregar el objeto RsNeDB al prototipo de Vue
  Vue.prototype.$rsNeDB = (databaseName) => new RsNeDB(databaseName);
};
