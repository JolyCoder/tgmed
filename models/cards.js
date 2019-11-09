const db = require("../parts/db")

exports.getCard = (id, cb) => {
	db.get().collection("cards").find().toArray((err, docs) => {
		for(var card of docs) {
			if(card.id == id) {
				return cb(err, card);
			}
		}
	});
	return cb("not find", []);
};
