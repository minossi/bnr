#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var http = require('http');
var sio = require('socket.io');
var cio = require('socket.io-client');
var program = require('commander');
var fu = require('./fu.node');

program
	.version('0.0.1')
	.option('-u, --url <url>',   'BnR Agent Url to connect', String, '')
	.option('-p, --port <port>', 'BnR Agent Port [8080]', Number, 8080)
	.option('-F, --FQN <FQN>',   'BnR Agent Fully Qualified Name', String, 'state-server')
	.option('-m, --mode <mode>', 'BnR Agent Mode [server | client]', String, 'server')
	.parse(process.argv);

console.log("FQN:       \t%s", program.FQN);
console.log("Parent Url:\t%s", program.url);
console.log("Role Mode: \t%s", program.mode);
console.log("Service Port:\t%s", program.port);


if(program.mode == 'client'){

	var io = cio.connect(program.url);
	
	io.emit('checkin', {mode:program.mode, port:program.port, fqn:program.FQN, url:program.url}, function(result) {
		
		if(result)
			console.log("checkin soket :\t%s", result);
		else
			console.log("checkin error");
	});
	
	io.on('push file', function (job, fn) {
		
		var thePath = process.cwd() + '/' + job.name;
		
		console.log(thePath,path.dirname(thePath));
		
		//fu.mkdir_p(path.dirname(thePath),0755,function(err){
			
		//	if(err) throw err;
			
			fs.writeFile(thePath,job.body, 'binary', function(err) {
	
				if (err) throw err
				
				console.log('file: %s saved', job.name);
				
				fn(true);
			});
		//});
	});
	
	io.on('build stage', function (job, fn) {
		fn(true);
	});
	
	io.on('build test', function (job, fn) {
		fn(true);
	});
		
}else if(program.mode == 'server') {

var clients = {};
var sockets = {};

var io = sio.listen(fu.server);

io.set('log', false);
//io.set('log level', 2); 
//var levels = [
//    'error' 
//  , 'warn'
//  , 'info'
//  , 'debug'
//];
io.sockets.on('connection', function (socket) {
	
 	socket.on('checkin', function (whoami, fn) {
		
		console.log('checkin:', whoami);	

		clients[socket.id] = whoami;
		sockets[socket.id] = socket;

		fn(socket.id);
	});
	
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
		var fcount = job.agents.length * job.files.length;
		
		job.agents.forEach( function (socketId, idx) {
			
			console.log(socketId, idx);
					
			job.files.forEach( function(file, idx) {
				
				console.log('push file: ',file,idx);
					
				fs.readFile(process.cwd() + '/' + file, 'binary',function( err, fileData) {
				
					if(err) {
						console.log('file read error' + err);
						process.exit();
					}
					
					var destSocket = sockets[socketId];
					
					if(destSocket){
						console.log('dest file:' + file);
						var subjob = {name:job.dest+'/'+file,body:fileData};
						destSocket.emit('push file',subjob,function(result){
							
							if(result)
								console.log('send %s complete', subjob.name);
								
							fcount -= 1;
							
							if(!fcount)
								fn(true);

						});
					}else{
						console.log('dest not found');
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
	
	socket.on('reconnect', function() {
		console.log('reconnect agent');
				
		clients[socket.id] = socket;
		sockets[socket.id] = socket;
	});

	socket.on('disconnect', function() {
		console.log('disconnect agent');
				
		//delete clients[socket.id];
		//delete sockets[socket.id];
	});
});
	console.log('run agent service');
	
	fu.listen(program.port, null);
}

