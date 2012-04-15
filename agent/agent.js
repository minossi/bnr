#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var sio = require('socket.io');
var cio = require('socket.io-client');
var program = require('commander');
var fu = require('./fu.node');

program
	.version('0.0.1')
	.option('-u, --url <url>',   'BnR Agent Url to connect', String, '')
	.option('-p, --port <port>', 'BnR Agent Port [8080]', Number, 8080)
	.option('-F, --FQN <FQN>',   'BnR Agent Fully Qualified Name', String, 'agent')
	.option('-m, --mode <mode>', 'BnR Agent Mode [build | deploy | operation]', String, 'build')
	.parse(process.argv);

console.log("FQN:       \t%s", program.FQN);
console.log("Parent Url:\t%s", program.url);
console.log("Role Mode: \t%s", program.mode);
console.log("Service Port:\t%s", program.port);


function keys(obj){
	var ks = [];
	for(k in obj){
		ks.push(k);
	}
	return ks;
}

var clients = {};

var io = sio.listen(fu.server);

//log off
//io.set('log', false);
io.set('log level', 2); 
//var levels = [
//    'error'
//  , 'warn'
//  , 'info'
//  , 'debug'
//];

io.sockets.on('connection', function (socket) {
	
//	console.log('id: %s', socket.id);

//	socket.emit('who', program.FQN, function( are_you ) {
//		console.log('connect to' + are_you);
//  	});

	clients[socket.id] = {mode:'', port:0, fqn:'', url:'',alive:true};

 	socket.on('checkin', function (whoami, fn) {
		
		console.log(whoami);	

		clients[socket.id]['fqn'] = whoami.fqn;
		clients[socket.id]['url'] = whoami.url;
		
		fn(true);
	});

	socket.on('clients', function(data, fn) {
		fn(clients);
	});

	socket.on('push file', function (data, fn) {

		fs.writeFile(__dirname + '/' + data.name,data.body, 'binary', function(err) {
			if (err){ 
				fn(false);
				throw err
			};
			console.log('file: %s saved', data.name);
			fn(true);
		});
	});
	
	socket.on('dir', function (dir, fn) {

		fs.readdir(__dirname + '/' + dir, function( err, files) {
			
			if(err) throw err;
			
			fn(files);
		});
	});
	
	socket.on('pull file', function (filePath, fn) {
		
		fs.readFile(__dirname + '/' + filePath, 'binary', function( err, data) {
						
			if(err) throw err; 
			
			if( Buffer.isBuffer(data) ){
				
				console.log('buffer object');
				fn({body:data.toString()});

			}else{
				
				console.log('other object');
				fn({body:data});
			
			}
		});
	});

	socket.on('disconnect', function() {
		console.log('disconnect agent');
		delete clients[socket.id];
	});
});


if( program.url ){

	var client = cio.connect(program.url);
	
	client.emit('checkin', {mode:program.mode, port:program.port, fqn:program.FQN, url:program.url}, function(result) {
		
		if(result)
			console.log("checkin complete!");
		else
			console.log("checkin error");
	});
	
} else {
	console.log('run agent service');
	fu.listen(program.port, null);
}

