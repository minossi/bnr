/* 
 * Copyright (c) 2011-2012 Actus Ltd. and its suppliers.
 * All rights reserved. 
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *
 * [1].  Redistributions of source code must retain the above copyright notice, 
 *       this list of conditions and the following disclaimer. 
 *
 * [2]. Redistributions in binary form must reproduce the above copyright notice, 
 *       this list of conditions and the following disclaimer in the documentation 
 *       and/or other materials provided with the distribution.
 *
 * [3]. Neither the name of the organization nor the names of its contributors may be
 *        used to endorse or promote products derived from this software without 
 *        specific prior written permission. 
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND 
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */




var spawn     		= require('child_process').spawn;
var fs 				= require('fs');
var path 			= require('path');
var fio     		= require('../utils/file_io.node');
var de 				= require('../utils/debugger.node');

var TAG 			= 'NGit';

var ngit 			= exports;



/*
 *	NGit
 */
ngit.version = function( callback ) {
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["v"] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.clone = function( workspace, repo, callback) {
	
    var cmd;
    
    cmd = spawn( PATH.BGIT, [ "c", workspace, repo ] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ 
        
        if( repo == GIT_REPO.GMKT_BN || repo == GIT_REPO.ACT_BN ) {
            if( !fio.isRealPathSync( PATH.WORK_REPO_GIT_GMKT_LOG ) ) {
        	    de.log(TAG, 'there is not existed storage folder');
			    fio.mkdirSync( PATH.WORK_REPO_GIT_GMKT_LOG );
		    }
        }
        
        callback('exit', null);
    });
    
    return cmd;
};

ngit.fetch = function( callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["f"] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.pull = function( callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["pl"] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.push = function( branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["ps", branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;

};

ngit.addBranch = function( workspace, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["b", workspace, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.addRBranch = function( workspace, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["rb", workspace, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.deleteBranch = function( workspace, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["db", workspace, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.deleteRBranch = function( workspace, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["drb", workspace, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.addTag = function( workspace, tag, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["t", workspace, tag, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.addRTag = function( workspace, tag, branch, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["rt", workspace, tag, branch] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.deleteTag = function( workspace, tag, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["drt", workspace, tag] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};

ngit.deleteRTag = function( workspace, tag, callback ) {
    
    var cmd;
    
    cmd = spawn( PATH.BGIT, ["drt", workspace, tag] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
};







/*
 *    MGit
 */
ngit.m_version = function( callback ) {

    var cmd;
    
    cmd = spawn( PATH.MGIT, ["v"] );
        
    cmd.stdout.on('data',function(data){ callback(null, data);});
    cmd.stderr.on('data',function(data){ callback(null, data);});
    cmd.on('exit', function(code){ callback('exit', null);});
    
    return cmd;
}




