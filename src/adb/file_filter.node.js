







var spawn         	= require('child_process').spawn;
var fs 				= require('fs');
var path 			= require('path');
var de 				= require('../utils/debugger.node');

var TAG 			= 'FileFilter';

var ffilter 		= exports;



ffilter.filter = function( path, ext, callback ) {
    
    var packagesCmd;
    
    if(ext)
        packagesCmd = spawn('find', [path, '-name', '*.' + ext]);
    else
        packagesCmd = spawn('find', [path, '-name', '*.*' ]);
        
    var datas = '';
    packagesCmd.stdout.on('data', function (data) {
        
        datas += data;
    });
    
    packagesCmd.on('exit', function (code) {

        if(code == 0) {
            var packages = [];
            var lines = datas.toString().split('\n');
            for(var i=0; i < lines.length; i++){
                if (i == 0) continue;
                if(lines[i].trim().length == 0) continue;
                packages.push(lines[i].trim());
            }
            callback(null, packages);
        }
        else
            callback("FAIL: adb packages", []);
    });
}
