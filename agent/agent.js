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
	.option('-m, --mode <mode>', 'BnR Agent Mode [deploy | terminal]', String, 'terminal')
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
var sockets = {};

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

//clients[socket.id] = {mode:'', port:0, fqn:'', url:'',alive:true};

 	socket.on('checkin', function (whoami, fn) {
		
		console.log(whoami);	

		clients[socket.id] = whoami;
		sockets[socket.id] = socket;

		fn(true);
	});
	
//	 socket.on('checkout', function (id, fn) {
//		
//		console.log('checkout called ' + id);	
//
//		delete clients[id];
//
//		fn(true);
//	});

	socket.on('clients', function(data, fn) {
		console.log('CLIENTS:' + clients);
		fn(clients);
	});

	socket.on('push file', function (data, fn) {

		fs.writeFile(process.cwd() + '/' + data.name,data.body, 'binary', function(err) {
			if (err){ 
				fn(false);
				throw err
			};
			console.log('file: %s saved', data.name);
			fn(true);
		});
	});
	
	socket.on('push to agent', function(job, fn) {
	//job = {agents:['id342432','234234234324234','234234234234'],
	//		   dest: 'path\to\dir',
	//		   files:[file-list,]
	//       }
	
		job.agents.forEach( function (socketId, idx) {
			
			console.log(socketId, idx);
					
			job.files.forEach( function(file, idx) {
				
				console.log(file,idx);
					
				fs.readFile(process.cwd() + '/' + file, 'binary',function( err, data) {
				
					if(err) {
						console.log('file read error' + err);
						process.exit();
					}
					
					var destSocket = sockets[socketId];
					
					if(destSocket){
						destSocket.emit('push file',{name:job.dest+'/'+file,body:data},function(result){
							console.log('send file complete');
							//process.exit();
						});
					}
				});
			});
		});
	});
	
	socket.on('dir', function (dir, fn) {

		fs.readdir(process.cwd() + '/' + dir, function( err, files) {
			
			if(err) throw err;
			
			fn(files);
		});
	});
	
	socket.on('pull file', function (filePath, fn) {
		
		fs.readFile(process.cwd() + '/' + filePath, 'binary', function( err, data) {
						
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
		delete sockets[socket.id];
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
	
	client.on('push file', function (data, fn) {

		fs.writeFile(process.cwd() + '/' + data.name,data.body, 'binary', function(err) {
			if (err){ 
				fn(false);
				throw err
			};
			console.log('file: %s saved', data.name);
			fn(true);
		});
	});
	
}else{

	console.log('run agent service');
	fu.listen(program.port, null);
}

