/* Copyright 2009,2010 Ryan Dahl <ry@tinyclouds.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


/* this module get from node_chat server (https://github.com/ry/node_chat/blob/master/fu.js)
 * and modified some code for this project.
 */

var createServer 	= require("http").createServer;
var fs 				= require("fs");
var sys 			= require("sys");
var url 			= require("url");
var path 			= require('path');
var sio             = require('socket.io');
var cio             = require('socket.io-client');
//var program         = require('commander');

DEBUG 				= false;

var fu 				= exports;

fu.notFound 		= notFound;

var NOT_FOUND 		= "Not Found\n";

var handlerMap 		= {};

var notFound = function (req, res) {
	res.writeHead(404, { "Content-Type": "text/plain"
	, "Content-Length": NOT_FOUND.length
	});
	
	res.end(NOT_FOUND);
}

fu.server = createServer(function (req, res) {
//	de.log('createServer');
    res.simpleText = function (code, body) {
      res.writeHead(code, { "Content-Type": "text/plain"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };

    res.simpleJSON = function (code, obj) {
      var body = new Buffer(JSON.stringify(obj));
      res.writeHead(code, { "Content-Type": "text/json"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };  
    
    if (req.method === "GET" || req.method === "HEAD" || req.method === "POST") {
    	var handler = handlerMap[url.parse(req.url).pathname] || null;
		if(handler){
			handler(req, res);			
		} else {
			var uri = url.parse(req.url).pathname
			     , fileName = path.join(process.cwd(), uri);
			path.exists(fileName, function(exists) {
				if(!exists) {
				  notFound(req,res);
				  return;
				}

				if (fs.statSync(fileName).isDirectory()) fileName += "index.html";

				path.exists(fileName, function(exists) {
					if(!exists) {
				  		notFound(req,res);
				  		return;
					}
					fu.staticHandler(fileName)(req,res);
				});
			});
		}
  	}
});

//fu.server = server;

fu.setHandler = function (path, handler) {
  handlerMap[path] = handler;
};

fu.listen = function (port, host) {
	fu.server.listen(port, host);
	sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

fu.close = function () { fu.server.close(); };

function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
};

fu.staticHandler = function (filename) {
  var body, headers;
  var content_type = fu.mime.lookupExtension(extname(filename));

  function loadResponseData(callback) {
    if (body && headers && !DEBUG) {
      callback();
      return;
    }

    sys.puts("loading " + filename + "...");
    fs.readFile(filename, function (err, data) {
      if (err) {
        sys.puts("Error loading " + filename);
      } else {
        body = data;
        headers = { "Content-Type": content_type
                  , "Content-Length": body.length
                  };
        if (!DEBUG) headers["Cache-Control"] = "public";
        sys.puts("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};

fu.clients = {};
fu.sockets = {};

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
	
	console.log(fu.clients);
	
 	socket.on('checkin', function (whoami, fn) {
		
		console.log('checkin:', whoami);	

		fu.clients[socket.id] = whoami;
		fu.sockets[socket.id] = socket;
		
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
					
					var destSocket = fu.sockets[socketId];
					
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
				
		fu.clients[socket.id] = socket;
		fu.sockets[socket.id] = socket;
	});

	socket.on('disconnect', function() {
		console.log('disconnect agent');
				
		delete fu.clients[socket.id];
		delete fu.sockets[socket.id];
	});
});
//	console.log('run agent service');
//	
//	fu.listen(program.port, null);


// stolen from jack- thanks
fu.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return fu.mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  TYPES : { ".3gp"   : "video/3gpp"
          , ".a"     : "application/octet-stream"
          , ".ai"    : "application/postscript"
          , ".aif"   : "audio/x-aiff"
          , ".aiff"  : "audio/x-aiff"
          , ".asc"   : "application/pgp-signature"
          , ".asf"   : "video/x-ms-asf"
          , ".asm"   : "text/x-asm"
          , ".asx"   : "video/x-ms-asf"
          , ".atom"  : "application/atom+xml"
          , ".au"    : "audio/basic"
          , ".avi"   : "video/x-msvideo"
          , ".bat"   : "application/x-msdownload"
          , ".bin"   : "application/octet-stream"
          , ".bmp"   : "image/bmp"
          , ".bz2"   : "application/x-bzip2"
          , ".c"     : "text/x-c"
          , ".cab"   : "application/vnd.ms-cab-compressed"
          , ".cc"    : "text/x-c"
          , ".chm"   : "application/vnd.ms-htmlhelp"
          , ".class"   : "application/octet-stream"
          , ".com"   : "application/x-msdownload"
          , ".conf"  : "text/plain"
          , ".cpp"   : "text/x-c"
          , ".crt"   : "application/x-x509-ca-cert"
          , ".css"   : "text/css"
          , ".csv"   : "text/csv"
          , ".cxx"   : "text/x-c"
          , ".deb"   : "application/x-debian-package"
          , ".der"   : "application/x-x509-ca-cert"
          , ".diff"  : "text/x-diff"
          , ".djv"   : "image/vnd.djvu"
          , ".djvu"  : "image/vnd.djvu"
          , ".dll"   : "application/x-msdownload"
          , ".dmg"   : "application/octet-stream"
          , ".doc"   : "application/msword"
          , ".dot"   : "application/msword"
          , ".dtd"   : "application/xml-dtd"
          , ".dvi"   : "application/x-dvi"
          , ".ear"   : "application/java-archive"
          , ".eml"   : "message/rfc822"
          , ".eps"   : "application/postscript"
          , ".exe"   : "application/x-msdownload"
          , ".f"     : "text/x-fortran"
          , ".f77"   : "text/x-fortran"
          , ".f90"   : "text/x-fortran"
          , ".flv"   : "video/x-flv"
          , ".for"   : "text/x-fortran"
          , ".gem"   : "application/octet-stream"
          , ".gemspec" : "text/x-script.ruby"
          , ".gif"   : "image/gif"
          , ".gz"    : "application/x-gzip"
          , ".h"     : "text/x-c"
          , ".hh"    : "text/x-c"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".ics"   : "text/calendar"
          , ".ifb"   : "text/calendar"
          , ".iso"   : "application/octet-stream"
          , ".jar"   : "application/java-archive"
          , ".java"  : "text/x-java-source"
          , ".jnlp"  : "application/x-java-jnlp-file"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".m3u"   : "audio/x-mpegurl"
          , ".m4v"   : "video/mp4"
          , ".man"   : "text/troff"
          , ".mathml"  : "application/mathml+xml"
          , ".mbox"  : "application/mbox"
          , ".mdoc"  : "text/troff"
          , ".me"    : "text/troff"
          , ".mid"   : "audio/midi"
          , ".midi"  : "audio/midi"
          , ".mime"  : "message/rfc822"
          , ".mml"   : "application/mathml+xml"
          , ".mng"   : "video/x-mng"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mp4v"  : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".ms"    : "text/troff"
          , ".msi"   : "application/x-msdownload"
          , ".odp"   : "application/vnd.oasis.opendocument.presentation"
          , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
          , ".odt"   : "application/vnd.oasis.opendocument.text"
          , ".ogg"   : "application/ogg"
          , ".p"     : "text/x-pascal"
          , ".pas"   : "text/x-pascal"
          , ".pbm"   : "image/x-portable-bitmap"
          , ".pdf"   : "application/pdf"
          , ".pem"   : "application/x-x509-ca-cert"
          , ".pgm"   : "image/x-portable-graymap"
          , ".pgp"   : "application/pgp-encrypted"
          , ".pkg"   : "application/octet-stream"
          , ".pl"    : "text/x-script.perl"
          , ".pm"    : "text/x-script.perl-module"
          , ".png"   : "image/png"
          , ".pnm"   : "image/x-portable-anymap"
          , ".ppm"   : "image/x-portable-pixmap"
          , ".pps"   : "application/vnd.ms-powerpoint"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".ps"    : "application/postscript"
          , ".psd"   : "image/vnd.adobe.photoshop"
          , ".py"    : "text/x-script.python"
          , ".qt"    : "video/quicktime"
          , ".ra"    : "audio/x-pn-realaudio"
          , ".rake"  : "text/x-script.ruby"
          , ".ram"   : "audio/x-pn-realaudio"
          , ".rar"   : "application/x-rar-compressed"
          , ".rb"    : "text/x-script.ruby"
          , ".rdf"   : "application/rdf+xml"
          , ".roff"  : "text/troff"
          , ".rpm"   : "application/x-redhat-package-manager"
          , ".rss"   : "application/rss+xml"
          , ".rtf"   : "application/rtf"
          , ".ru"    : "text/x-script.ruby"
          , ".s"     : "text/x-asm"
          , ".sgm"   : "text/sgml"
          , ".sgml"  : "text/sgml"
          , ".sh"    : "application/x-sh"
          , ".sig"   : "application/pgp-signature"
          , ".snd"   : "audio/basic"
          , ".so"    : "application/octet-stream"
          , ".svg"   : "image/svg+xml"
          , ".svgz"  : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".t"     : "text/troff"
          , ".tar"   : "application/x-tar"
          , ".tbz"   : "application/x-bzip-compressed-tar"
          , ".tcl"   : "application/x-tcl"
          , ".tex"   : "application/x-tex"
          , ".texi"  : "application/x-texinfo"
          , ".texinfo" : "application/x-texinfo"
          , ".text"  : "text/plain"
          , ".tif"   : "image/tiff"
          , ".tiff"  : "image/tiff"
          , ".torrent" : "application/x-bittorrent"
          , ".tr"    : "text/troff"
          , ".txt"   : "text/plain"
          , ".vcf"   : "text/x-vcard"
          , ".vcs"   : "text/x-vcalendar"
          , ".vrml"  : "model/vrml"
          , ".war"   : "application/java-archive"
          , ".wav"   : "audio/x-wav"
          , ".wma"   : "audio/x-ms-wma"
          , ".wmv"   : "video/x-ms-wmv"
          , ".wmx"   : "video/x-ms-wmx"
          , ".wrl"   : "model/vrml"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xbm"   : "image/x-xbitmap"
          , ".xhtml"   : "application/xhtml+xml"
          , ".xls"   : "application/vnd.ms-excel"
          , ".xml"   : "application/xml"
          , ".xpm"   : "image/x-xpixmap"
          , ".xsl"   : "application/xml"
          , ".xslt"  : "application/xslt+xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};