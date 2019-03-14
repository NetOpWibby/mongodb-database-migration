"use strict";



//  P A C K A G E S

const debug = require("debug")("migrate");
const test = require("assert");

//  U T I L

const migration = require("../");



//  B E G I N

migration.run((err, db, done) => {
  if (err)
    done(db, err);

  const ds = db.collection("domains");

  ds.find().toArray()
    .then(domains => {
      test.ok(domains.length > 0, "Expecting one or more domains");
      debug(`Domains: ${domains.length}`);

      const promises = [];

      domains.forEach(domain => {
        promises.push(
          ds.findAndModify(
            {
              _id: domain._id
            },
            [
              [
                "_id",
                1
              ]
            ],
            {
              $rename: {
                "official.id": "registrar.id",
                "official.name": "registrar.name",
                "official.email": "registrar.email",
                "official.url": "registrar.url",
                "official.phone": "registrar.phone"
              }
            }
          ),

          ds.update(
            {
              _id: domain._id
            },
            {
              $unset: {
                official: ""
              }
            }
          )
        );
      });

      Promise.all(promises)
        .then(convertedDomains => {
          debug(`Converted ${convertedDomains.length} domains`);
          done(db);
        })
        .catch(err => done(db, err));
    })
    .catch(err => done(db, err));
});
