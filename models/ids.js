const db = require("../parts/db");

exports.addId_model = (id1, id2, cb) => {
	db.get().collection("ids").insert({
		"id1": id1,
		"id2": id2
	}, (err, result) => {
		cb(err, result);
	})
};
