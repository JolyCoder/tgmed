const db = require("../parts/db")

exports.addSchedule = (schedule, cb) => {
	db.get().collection("schedules").insertOne(schedule, (err, result) => {
		cb(err, result);
	});
};

exports.getSchedules = (cb) => {
	db.get().collection("schedules").find().toArray((err, docs) => {
		cb(err, docs);
	});
};
