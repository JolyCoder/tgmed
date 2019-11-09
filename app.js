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

		bot.on("callback_query", (msg) => {
			var splitMsg = msg.data.split(" ");
			console.log(splitMsg);
			if(splitMsg[0] == "clinic") {
				medsModel.getMedbyNumber_model(splitMsg[1], (err, result) => {
					if(result == "not find") {
						return console.log(result);
					}
					var buttons = []
					var message = "";
					for(var part of Object.keys(result.parts)) {
						buttons.push([{"text": part, "callback_data": "part " + part.num + " " + part.name}])
					}
					bot.sendMessage(msg.message.chat.id, "Выберите отдел", {reply_markup: JSON.stringify({
						inline_keyboard: buttons
					})});
				})
			}
			else if(splitMsg[0] == "part") {
				medsModel.getMedbyNumber_model(splitMsg[1], (err, result) => {
					if(result == "not find")
						return console.log(result);
					var buttons = [];
					for(var chel of result[splitMsg[2]]) {
						buttons.push([{"text": chel, "callback_data": msg.data + " " + chel}])
					}
						
					bot.sendMessage(msg.message.chat.id, "Выберите врача", {reply_markup: JSON.stringify({
						inline_keyboard: buttons
					})});
				});
			}
		});
		
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
							buttons.push([{"text": clinic.name, "callback_data": "clinic " + clinic.num}])
						}
					}
					bot.sendMessage(msg.chat.id, "Выберите клинику", {reply_markup: JSON.stringify({
						inline_keyboard: buttons
					})});
				});
			}
		})
	}
})
