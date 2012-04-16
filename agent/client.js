#!/usr/bin/env node

var fs = require('fs');
var sio = require('socket.io-client');
var program = require('commander');
var dns = require('dns');
var os = require('os');

program
	.version('0.0.1')
	.option('-u, --url <address>', 'RnB Server Url','http://localhost:8080/agents')
	//.parse(process.argv)

//var agent = sio.connect(program.url);

//agent.on('news', function(data) {
//	console.log(data);
//});

//dns.lookup(os.hostname(), function (err, addr, fam) {
//  
//  	var agentUrl = 'http://' + addr + ':' + port;
//  	
//  	//console.log('my addr: '+ agentUrl);
//
//	agent.emit('who', agentUrl, function( are_you ) {
//		console.log(agentUrl + ' ==> ' + are_you);
//	});
//	
//	agent.emit('clients', agentUrl, function( clients ) {
//		console.log('clients:' + clients);
//	});
//})
//var agent = "";

var AGENT_URL = "http://localhost:8080";

program
	.command('status')
	.description("connected angent list")
	.action(function(){
		console.log("list command...");
		
		var agent = sio.connect(AGENT_URL);
		agent.emit('clients','',function(result){
			console.log(result);
			process.exit();
		}); 	
	});

program
	.command('push <file>')
	.description("connected angent list")
	.action(function(filePath){
		
		console.log("push: %s",filePath);
		
		var socket = sio.connect(AGENT_URL);
		
		socket.on('connect', function() {	

			fs.readFile(process.cwd() + '/' + filePath, function( err, data) {
				
				if(err) {
					console.log('file read error' + err);
					process.exit();
				}
				socket.emit('push file',{name:filePath,body:data},function(result){
					console.log('send file complete');
					process.exit();
				});
			});
		});
	});
	
program
	.command('pushagent <agent-id,agent-id>, <file,file>')
	.description("connected angent list")
	.action(function(agentList, fileList){
	
		var agents = agentList.split(',');
		var files = fileList.split(',');
		job = {agents:agents
				,dest: 'push-test'
				,files:files};
	
		console.log("push: %s", job);
		
		var socket = sio.connect(AGENT_URL);
		
		socket.on('connect', function() {	
			
			socket.emit('push to agent', job, function(result){
				console.log('send file complete');
				process.exit();
			});
		});
	});

program
	.command('broadcast <file,file>')
	.description("connected angent list")
	.action(function(fileList){

		var files = fileList.split(',');
	
		console.log("push: %s", files);
		
		var socket = sio.connect(AGENT_URL);
		
		socket.on('connect', function() {	
			
			socket.emit('push to all agents', files, function(result){
				console.log('send file complete');
				process.exit();
			});
		});
	});
		
program
	.command('dir <path>')
	.description("list of directory which name is <path>")
	.action(function(filePath){
		
		var socket = sio.connect(AGENT_URL);
		
		socket.on('connect', function() {	
			
			socket.emit('dir',filePath,function(dir){
				
				console.log('dir %s contain:', filePath);
				
				for(var idx in dir)
					console.log('[%d]: %s', idx,dir[idx]);
				process.exit();
			});
		});
	});
	
program
	.command('pull <request-file> <local-file-name>')
	.description("pull file from server file name is <in-file>, out file is <out-file>")
	.action(function(ifile, ofile){
				
		var socket = sio.connect(AGENT_URL);
		
		socket.on('connect', function() {	
			
			socket.emit('pull file',ifile,function(data){
				
				if(!data) throw 'pull file error';

				fs.writeFile(process.cwd() + '/' + ofile, data.body, 'binary', function( err) {
					if(err) throw err;	
					
					console.log('pull complete');
					
					process.exit();
				});
			});
		});
	});

program.parse(process.argv);
