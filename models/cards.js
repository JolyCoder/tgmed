const db = require("../parts/db")

exports.getCardByID = (id, cb) => {
	db.get().collection("cards").find().toArray((err, docs) => {
		for(var card of docs) {
			console.log("card", card)
			if(card.id == id) {
				console.log("IM HERE");
				return cb(err, card);
			}
		}
	});
	return cb("not find", []);
};
