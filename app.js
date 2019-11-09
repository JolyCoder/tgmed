const express = require("express"),
	  db = require("./parts/db"),
	  cookie_parser = require("cookie-parser"),
	  TelegramBot = require('node-telegram-bot-api'),
	  config = require('./parts/config'),
	  medsController = require("./controllers/meds"),
	  medsModel = require("./models/med");

var app = express();

app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookie_parser());

const bot = new TelegramBot("963374939:AAECJC50Qi4iaROG8j48JKBQ48L5Udt9-m8", {
	polling: true
});

var current_connects = []

db.connect(config.mongouri, config.mogoname, (err) => {
	if(err) {
		return console.log(err);
	}
	else {
		app.listen(process.env.PORT || 8080);

		// Request Controllers
		//
		app.post("/add", medsController.addMed_Controller);
		bot.on('message', (msg) => {
			if(msg.text == "/start") {
				medsModel.getMed_model((err, docs) => {
					var message = "";
					var buttons = []
					if(err) {
						return console.log(err);
					}
					else {
						for(var clinic of docs) {
							buttons.push({"text": clinic.name, "callback_data": clinic.num})
						}
					}
					bot.sendMessage(msg.chat.id, "Выберите клинику", buttons);
				});
			}
			else {
				medsModel.getMedbyNumber_model(msg.text, (err, result) => {
					if(result == "not find") {
						return console.log(result);
					}
					var message = "";
					for(var part of Object.keys(result.parts)) {
						message += part + "\n";
					}
					bot.sendMessage(msg.chat.id, message);
				})
			}
		})
	}
})
