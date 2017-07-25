/*

I basically just need an ultra-simple fallback server...



*/

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs-extra");

var chokidar = require("chokidar");

const app = express();

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({
	perMessageDeflate: false,
	server: server
});

var socket;

wss.on("connection", function(ws){
	console.log("connected");

	var update = function(){
		fs.readFile("./public/test.txt", 'utf8', (err, data) => {
			if (err) throw err;
			ws.send(data)
		});
	};

	socket = ws;
	ws.on("message", function(txt){
		fs.writeFile("./public/test.txt", txt, (err) => {
			if (err) throw err;
			console.log("saved!");
		})
	});


	chokidar.watch("./public/test.txt").on("change", () => {
		console.log("changed");
		update();
	});
	update();
});


server.listen(80, function(){
	console.log("listening");
});