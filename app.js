const express = require("express"),
	  db = require("./parts/db"),
	  cookie_parser = require("cookie-parser"),
	  TelegramBot = require('node-telegram-bot-api'),
	  config = require('./parts/config'),
	  medsController = require("./controllers/meds"),
	  medsModel = require("./models/med"),
	  scheduleModel = require("./models/schedule"),
	  CronJob = require("cron").CronJob,
	  cardModel = require("./models/cards"),
	  priemModel = require("./models/priem");

var app = express();

app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookie_parser());

const bot = new TelegramBot("963374939:AAECJC50Qi4iaROG8j48JKBQ48L5Udt9-m8", {
	polling: true
});



var current_connects = {};

var current_queue = [];

var notifications = [];

db.connect(config.mongouri, config.mogoname, (err) => {
	if(err) {
		return console.log(err);
	}
	else {
		app.listen(process.env.PORT || 8080);

		// Request Controllers
		
		app.post("/add", medsController.addMed_Controller);

		// Cron set
		
		const jobLek = new CronJob('30 * * * * *', () => {
			console.log("Cron Work!");
			scheduleModel.getSchedules((err, docs) => {
				var now = new Date().getHours();
				for(var schedule of docs) {
					console.log((now * 60 + new Date().getMinutes()) % parseInt(schedule.on) == 0)
					if((now * 60 + new Date().getMinutes()) % parseInt(schedule.on) == 0 && now >= parseInt(schedule.from) && now <= parseInt(schedule.to)) {
						bot.sendMessage(schedule.id, "Пора пить лекарство!");
					}
				}
			});	
		});
		
		const jobPriem = new CronJob('45 * * * * *', () => {
			priemModel.getPriem((err, docs) => {
				if(err) 
					return console.log(err);
				for(var priem of docs) {
					if(parseInt(priem.time) == (new Date).getDate() && !notifications.includes(priem.idUser)) {
						bot.sendMessage(priem.idUser, "Сегодня у вас прием у врача!");
						notifications.push(priem.idUser);
					}
				}
			});
		})
		jobLek.start();
		jobPriem.start();
		// Message Handlers

		bot.on("callback_query", (msg) => {
			var splitMsg = msg.data.split(" ");
			console.log(splitMsg);
			if(splitMsg[0] == "clinic") {
				medsModel.getMedbyNumber_model(splitMsg[1], (err, result) => {
					if(result == "not find") {
						return console.log(result);
					}
					var buttons = [];
					var message = "";
					for(var part of Object.keys(result.parts)) {
						buttons.push([{"text": part.toString(), "callback_data": "part " + splitMsg[1] + " " + part}]);
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
					for(var chel of result.parts[splitMsg[2]]) {
						buttons.push([{"text": chel.name, "callback_data": chel.id}]);
					}
					console.log(buttons);
					bot.sendMessage(msg.message.chat.id, "Выберите врача", {reply_markup: JSON.stringify({
						inline_keyboard: buttons
					})});
				});
			}
			else if(splitMsg[0] == "answer") {
				if(splitMsg[1] == "yes") {
					bot.sendMessage(msg.message.chat.id, "Вы добавлены в очередь!");
					priemModel.addPriem({
						"idUser": msg.message.chat.id.toString(),
						"idDoct": current_connects[msg.message.chat.id].toString(),
						"time": splitMsg[2]
					}, (err, docs) => {
						if(err)
							return console.log(err);
					});
					bot.sendMessage(current_connects[msg.message.chat.id], "Клиент согласился и был записан на прием!");
				}
				else {
					bot.sendMessage(msg.message.chat.id, "Запрос отклонен");
					bot.sendMessage(current_connects[msg.message.chat.id], "Запрос отклонен");
				}
			}
			else {
				current_connects[msg.data] = msg.message.chat.id;
				current_connects[msg.message.chat.id] = msg.data;
				bot.sendMessage(msg.message.chat.id, "Вы подключены к врачу!");
			}
		});
		
		bot.on('message', (msg) => {
			var splitMsg = msg.text.split(" ");
			if(msg.text == "/start") {
				medsModel.getMed_model((err, docs) => {
					var message = "";
					var buttons = [];
					if(err) {
						return console.log(err);
					}
					else {
						for(var clinic of docs) {
							buttons.push([{"text": clinic.name, "callback_data": "clinic " + clinic.num}]);
						}
					}
					bot.sendMessage(msg.chat.id, "Выберите клинику", {reply_markup: JSON.stringify({
						inline_keyboard: buttons
					})});
				});
			}
			else if(msg.text == "/schedule") {
				var splitMsg = msg.split(" ");
				var schedule = {
					"id": splitMsg[1],
					"from": splitMsg[2],
					"to": splitMsg[3],
					"on": splitMsg[4]
				};
				scheduleModel.addSchedule(schedule, (err, result) => {
					if(err)
						return console.log(err);
				});
			}
			else if(msg.text == "/disconnect") {
				bot.sendMessage(current_connects[msg.chat.id], "Вы отключены!");
				bot.sendMessage(msg.chat.id, "Вы отключены!");
			}
			else if(splitMsg[0] == "/addMed") {
				var buttons = {
					reply_markup: JSON.stringify({
						inline_keyboard: [
							[{"text": "Да", "callback_data": "answer yes " + splitMsg[1]}],
							[{"text": "Нет", "callback_data": "answer no"}]
						]
					})
				}
				bot.sendMessage(current_connects[msg.chat.id], "Врач предлагает вам записаться на прием " + splitMsg[1] + " чилса, желаете записаться?", buttons);
			}
			else if(msg.text == "/getCard") {
					cardModel.getCardByID(current_connects[msg.chat.id], (err, card) => {
						if(err)
							return;
						console.log(card);
						var message = card.name + "\n" +
									  card.bolz + "\n" +
									  card.gk + "\n" +
									  card.adrs + "\n";
						bot.sendMessage(msg.chat.id, message);
					});
			}
			else if(msg.text == "/priems") {
				priemModel.getPriem((err, docs) => {
					if(err)
						return;
					var message = "Ваши приемы: "	
					for(var priem of docs) {
						if(priem.idDoct == msg.chat.id) {
							cardModel.getCardByID(priem.idUser, (err, card) => {
								if(err)
									return;
								console.log(card);
								message += priem.time + " числа с " + card.name + ", ";
							});
							
						}
					}
					bot.sendMessage(msg.chat.id, message);

				});
			}
			else {
				console.log(current_connects);
				bot.sendMessage(current_connects[msg.chat.id], msg.text);
			}
		})
	}
})
