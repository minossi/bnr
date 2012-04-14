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

console.log('app:' + app);

program
	.version('0.0.1')
	.option('-p, --port <port>', 'RnB Server Port')
	.parse(process.argv)

var port = program.port ? parseInt(program.port): 8080;

var ws = sio.listen(app);

console.log('listen port: ' + port)

app.listen(port);

var keys = function( obj ) {
	var ks = [];
	for(var k in obj){
		ks.push(k);
	}
	return ks;
}

var clients = {};

ws.of('/agents').on('connection', function (socket) {

 	socket.on('who', function (agentUrl, fn) {
 		
 		clients[agentUrl] = socket;
 		
 		console.log(agentUrl + ' client connected....');
 		
 		require('dns').lookup(require('os').hostname(), function (err, addr, fam) {  
  	        if(err){
  	        }
  	        
  	        var myaddr  = 'http://' + addr + ':' + port;
  	        
			fn(myaddr);
		});
		
	});

	socket.on('clients', function (agentUrl, fn) {
			fn(keys(clients));
	});

	socket.on('disconnect', function() {
		console.log('disconnect agent');
	});
});

