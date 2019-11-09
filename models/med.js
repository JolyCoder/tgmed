const db = require("../parts/db")

exports.addMed_model = (med, cb) => {
	db.get().collection("meds").insert(med, (err, result) => {
		cb(err, result);
	})
};
