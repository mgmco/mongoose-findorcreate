'use strict';

/*!
 * Mongoose findOrCreate Plugin
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed

 This plugin has been completely re-written in ES6 and with a couple new caveats
 so it will work a little more efficiently.

 One thing that is now different is that if any conditions are passed with Mongo
 search parameters (like for example { updatedAt: { $exists: false } }), the
 plugin will stop trying to save those as the field.
 */

function findOrCreatePlugin(schema, opts) {
  schema.statics.findOrCreate = function findOrCreate(conditions) {
    const dirty = typeof arguments[1] === 'object' ? arguments[1] : null;
    const callback = typeof arguments[arguments.length - 1] === 'function' ? arguments[arguments.length - 1] : console.log;
    //const Model = this;
    let isNew = false;

    this.findOne(conditions, (err, object) => {
      if (err) return callback(err);
      if (object && !dirty) return callback(err, object, isNew);

      if (!object) {
        for (let field in conditions) {
          if (field.slice(0, 1) === '$') delete conditions[field];
        }

        object = new (this)(conditions);
        isNew = true;
      }

      if (dirty) {
        for (let field in dirty) {
          if (field.slice(0, 1) !== '$') object[field] = dirty[field];
        }
      }

      object.save((err) => {
        if (err) return callback(err);
        return callback(err, object, isNew);
      });
    });
  };
}

module.exports = findOrCreatePlugin;
