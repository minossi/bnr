#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var sio = require('socket.io');
var cio = require('socket.io-client');
var program = require('commander');

var app = http.createServer(function(req, res) {
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
});

program
	.version('0.0.1')
	.option('-u, --url <address>', 'BnR Agent Url to connect')
	.option('-p, --port <port>', 'BnR Agent Port')
	.option('-n, --fqn <FQN>', 'BnR Agent Fully Qualified Name')
	.option('-m, --mode <mode>', 'BnR Agent Mode [build | deploy | operation]')
	.parse(process.argv);

var url = program.url ? program.url:'http://localhost:8080';
var port = program.port ? parseInt(program.port): 8080;
var fqn = program.fqn ? program.name: 'agent';
var mode = program.mode ? program.mode: 

var io = sio.listen(app);

app.listen(port);

io.sockets.on('connection', function (socket) {
	socket.emit('who', program.name, function( are_you ) {
		console.log('connect to' + are_you);
  	});

 	socket.on('who', function (data, fn) {
		fn(program.name);
	});

	socket.on('file', function (fileName, fn) {
		fs.readFile(__dirname + '/' + fileName, function( err, data) {
			
			if(err) {
				console.log('file read error' + err);
				process.exit();
			}
			fn(data);
		});
	});

	socket.on('disconnect', function() {
		console.log('disconnect agent');
	});
});

