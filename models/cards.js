const db = require("../parts/db")

exports.getCard = (cb) => {
	db.get().collection("cards").find().toArray((err, docs) => {
		cb(err, docs)
	});
};
