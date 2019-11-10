const db = require("../parts/db")

exports.getPriem = (cb) => {
	db.get().collection("priems").find().toArray((err, docs) => {
		cb(err, docs);	
	});
}

exports.addPriem = (priem, cb) => {
	db.get().collection("priems").insertOne(priem, (err, docs) => {
		cb(err, docs);
	});
}
