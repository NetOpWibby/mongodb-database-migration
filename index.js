"use strict";



//  P A C K A G E S

const debug = require("debug")("migrate");
const MongoClient = require("mongodb").MongoClient;

//  U T I L S

const DB = process.env.DB;
const PORT = process.env.PORT;



//  B E G I N

function done(db, err) {
  if (db && db.close)
    db.close();

  if (err)
    debug(`err (name = ${err.name}, message = ${err.message}): ${err.stack}`);

  process.exit(0);
}

function run(migrate) {
  MongoClient.connect(`mongodb://localhost:${PORT}/${DB}`, (err, db) => {
    try {
      migrate(err, db, done);
    } catch(err) {
      done(db, err);
    }
  });
}



//  E X P O R T

module.exports = exports = {
  run
};
