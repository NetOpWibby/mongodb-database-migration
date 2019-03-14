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
        const registrar = domain.registrar;

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
                domain: "name",
                expiration: "expires" // this is new but does not need to be set below
              }
            }
          ),

          ds.update(
            {
              _id: domain._id
            },
            {
              $unset: {
                registrar: ""
              },
              $set: {
                created: "",
                changed: "",
                dnssec: "",
                registered: "",
                status: "",
                nameservers: [],

                "contacts.admin.handle": "",
                "contacts.admin.type": "",
                "contacts.admin.name": "",
                "contacts.admin.organization": "",
                "contacts.admin.email": "",
                "contacts.admin.address": "",
                "contacts.admin.zipcode": "",
                "contacts.admin.city": "",
                "contacts.admin.state": "",
                "contacts.admin.country": "",
                "contacts.admin.phone": "",
                "contacts.admin.fax": "",
                "contacts.admin.created": "",
                "contacts.admin.changed": "",

                "contacts.owner.handle": "",
                "contacts.owner.type": "",
                "contacts.owner.name": "",
                "contacts.owner.organization": "",
                "contacts.owner.email": "",
                "contacts.owner.address": "",
                "contacts.owner.zipcode": "",
                "contacts.owner.city": "",
                "contacts.owner.state": "",
                "contacts.owner.country": "",
                "contacts.owner.phone": "",
                "contacts.owner.fax": "",
                "contacts.owner.created": "",
                "contacts.owner.changed": "",

                "contacts.tech.handle": "",
                "contacts.tech.type": "",
                "contacts.tech.name": "",
                "contacts.tech.organization": "",
                "contacts.tech.email": "",
                "contacts.tech.address": "",
                "contacts.tech.zipcode": "",
                "contacts.tech.city": "",
                "contacts.tech.state": "",
                "contacts.tech.country": "",
                "contacts.tech.phone": "",
                "contacts.tech.fax": "",
                "contacts.tech.created": "",
                "contacts.tech.changed": "",

                "official.id": "",
                "official.name": registrar,
                "official.email": "",
                "official.url": "",
                "official.phone": ""
              }
            },
            {
              upsert: true
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
