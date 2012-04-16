#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var http = require('http');
var sio = require('socket.io');
var cio = require('socket.io-client');
var program = require('commander');
var mkdirp = require('mkdirp');
var fu = require('./fu.node');


function Client ( url ){
	
	this.io = io = cio.connect(program.url);
	
	theClient = this;
	
	io.on('push file', function (job, fn) {
			
		theClient.pushFile(job.name, job.body, fn);
	
	});
	
	io.on('pull file', function (path, fn) {
		theClient.pullFile(path, fn);
	});
		
	io.on('build stage', function (job, fn) {

		console.log('build test');

		fn(true);

	});
	
	io.on('build test', function (job, fn) {

		console.log('build test');
		
		fn(true);
	});
	
	return this;
}

Client.prototype.checkin = function( aMode, aPort, aFqn, anUrl, cb){
	
	io.emit('checkin', {mode:aMode, port:aPort, fqn:aFqn, url:anUrl}, function(result) {
		
		if(cb)
			cb(result);
		
		if(result)
			console.log("checkin socket :\t%s", result);
		else
			console.log("checkin error");
	});
	
} 

Client.prototype.pushFile =  function (file, body, fn) {
		
	var thePath = process.cwd() + '/' + file;

	console.log(thePath,path.dirname(thePath));
	
	mkdirp(path.dirname(thePath), 0755, function(err){
		
		if(err) throw err;
		
		fs.writeFile(thePath, body, 'binary', function(err) {
	
			if (err) throw err
			
			console.log('file: %s saved', file);
			
			fn(true);
		});
	});
}

//Client.prototype.pullFile =  function (path, fn) {
//	//tar.
//}

function Server( app ) { 

	this.app = app;
	this.clients = clients = {};
	this.sockets = sockets = {};
	this.io = io = sio.listen(this.app);
	
	theServer = this;

	io.set('log', false);
	//io.set('log level', 2);  //levels = [ 'error','warn','info','debug' ];
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
	
		socket.on('push to agents', function(job, fn) {
			theServer.pushFile(job.agents, job.files, fn);
		});	
		
		socket.on('push to all agents', function(files, fn) {

			theServer.pushFile(theServer.getIds(), files, fn);
		
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
		
		socket.on('release', function(job, fn) {
			theServer.release(job, fn); 
		});

		socket.on('rollback', function(job, fn) {
			theServer.rollback(job, fn); 
		});
	
	
		socket.on('reconnect', function() {
			
			console.log('reconnect agent');
				
			clients[socket.id] = socket;
			sockets[socket.id] = socket;
		});

		socket.on('disconnect', function() {
			console.log('disconnect agent');
				
			delete clients[socket.id];
			delete sockets[socket.id];
		});
	});
	return this;
}

Server.prototype.getIds = function( ) {
	
	var ids = [];
	
	for(var id in this.sockets) {
		ids.push( id );
	}
	return ids;
}

Server.prototype.listen = function( port, host ) {
	
	this.app.listen(port, host);

}

Server.prototype.pushFile = function(agents, files, fn) {

	var fcount = agents.length * files.length;

	agents.forEach( function (socketId, idx) {
		
		files.forEach( function(file, idx) {
						
			fs.readFile(process.cwd() + '/' + file, 'binary',function( err, fileData) {
		
				if(err) {
					console.log('file read error' + err);
					process.exit();
				}
			
				var destSocket = sockets[socketId];
			
				if(destSocket){
				
					console.log('dest file:' + file);						

					var subjob = { name:file, body:fileData };
				
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
}


Server.prototype.release = function(agents, files, fn) {

}

Server.prototype.rollback = function(agents, files, fn) {

}


program
	.version('0.0.1')
	.option('-u, --url <url>',   'BnR Agent Url to connect', String, '')
	.option('-p, --port <port>', 'BnR Agent Port [8080]', Number, 8080)
	.option('-F, --FQN <FQN>',   'BnR Agent Fully Qualified Name', String, 'build-server')
	.option('-m, --mode <mode>', 'BnR Agent Mode [server | client]', String, 'server')
	.parse(process.argv);


function displayInfo(program) {
	console.log("===========================================");
	console.log("FQN:       \t%s", program.FQN);
	console.log("Parent Url:\t%s", program.url);
	console.log("Role Mode: \t%s", program.mode);
	console.log("Service Port:\t%s", program.port);
	console.log("===========================================");
}

displayInfo(program);

if(program.mode == 'client'){
	
	if(!program.url){
		console.log("\n\n>>> 'client' mode must have URL (-u, -url <url>)\n\n");
		console.log(program.optionHelp());
		process.exit();
	}

	var client = new Client(program.url);
	
	client.checkin(program.mode, program.port, program.FQN, program.url);
			
}else if(program.mode == 'server') {
	
	if(program.url) {
		
		var client = new Client(program.url);
		client.checkin(program.mode, program.port, program.FQN, program.url);
	
	}
	
	var server = new Server( fu.server );	
	server.listen( program.port, null );
}


