const medsModel = require("../models/med")

exports.addMed_Controller = (req, res) => {
	medsModel.addMed_model(req.body, (err, result) => {
		if(err)
			return res.sendStatus(500) && console.log(err);
		else
			return res.sendStatus(200) && console.log(err);
	})	
};
