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

//https://gist.github.com/742162
fu.mkdir_p =  function (path, mode, callback, position) {
    mode = mode || 0777;
    position = position || 0;
    parts = require('path').normalize(path).split('/');

    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }

    var directory = parts.slice(0, position + 1).join('/');
    fs.stat(directory, function(err) {
        if (err === null) {
            mkdir_p(path, mode, callback, position + 1);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    mkdir_p(path, mode, callback, position + 1);
                }
            })
        }
    })
}

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