/*
    Copyright: Ilya Tvaliashvili
    VK: vk.com/ilyfo
    Please before using contact us!
*/

var MongoClient = require('mongodb').MongoClient;

var state = {
  db: null
};

exports.connect = function(url, name, done) {
  if (state.db) {
    return done();
  }

  MongoClient.connect(url, function(err, db) {
    if (err) {
      return done(err);
    }
    state.db = db.db(name);
    done();
  })
};

exports.get = function() {
  return state.db;
};
