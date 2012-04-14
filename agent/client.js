#!/usr/bin/env node

var fs = require('fs')
var sio = require('socket.io-client')
var program = require('commander');
var dns = require('dns');
var os = require('os');

program
	.version('0.0.1')
	.option('-u, --url <address>', 'RnB Server Url')
	.option('-p, --port <port>', 'RnB Server Port')
	.parse(process.argv)

var url = program.url ? program.url:'http://localhost:8080/agents';
var port = program.port ? parseInt(program.port): 8081;

var agent = sio.connect(url);

//agent.on('news', function(data) {
//	console.log(data);
//});

dns.lookup(os.hostname(), function (err, addr, fam) {
  
  	var agentUrl = 'http://' + addr + ':' + port;
  	
  	//console.log('my addr: '+ agentUrl);

	agent.emit('who', agentUrl, function( are_you ) {
		console.log(agentUrl + ' ==> ' + are_you);
	});
	
	agent.emit('clients', agentUrl, function( clients ) {
		console.log('clients:' + clients);
	});
	
})

