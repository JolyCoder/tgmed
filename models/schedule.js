const db = require("../parts/db")

exports.addSchedule = (schedule, cb) => {
  db.get().collection("schedule").insertOne(schedule, (err, result) => {
    cb(err, result);
  });
};

exports.getSchedules = (cb) => {
  db.get().collection("schedule").find().toArray((err, docs) => {
    cb(err, docs);
  });
};
