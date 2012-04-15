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




require('./config.node');
var de 				= require('./utils/debugger.node');
var finder 			= require('./utils/finder.node');
var storage 		= require('./data/storage.node');
var ngit            = require('./adb/ngit.node');
var ffilter         = require('./adb/file_filter.node');
var events 			= require('events');
var Profile 		= require('./stuff/profile.node');
var Release			= require('./stuff/release.node');
var Group			= require('./stuff/group.node');
//var Device 			= require('./stuff/device.node');
//var DeviceScheduler = require('./scheduler/device_scheduler.node');

var TAG 			= 'AdminManager';

// Define the constructor
function AdminManager() {
	events.EventEmitter.apply(this);
	de.log(TAG,'NEW');
	
	this.main 						= new Array();
	this.profiles 					= new Object();
	this.activityProfiles 			= new Object();
	this.profilePool 				= new Object();
	this.devicePool 				= new Object();
	
	this.releaseProfiles			= new Object();
	this.releasePool				= new Object();
	this.groupProfiles				= new Object();
	this.groupPool					= new Object();
	
	this.main = this;
	
	if(storage.isMakeStorage()) {
		storage.makeStorage();
        
        this.clone();
	}
	
	this.setProfiles();
	this.profilePool = this.setProfilePool();
	
	this.setReleaseProfiles();
	this.releasePool = this.setReleaseProfilePool();
	
	this.setGroupProfiles();
	this.groupPool = this.setGroupProfilePool();
	//this.addSchedulers();
    
    
};

AdminManager.prototype = new events.EventEmitter();
//require('util').inherits(Scheduler, events.EventEmitter);
AdminManager.prototype.constructor = AdminManager;
AdminManager.prototype.destructor = function() {
	de.log(TAG, 'Destructor');
};
// Export this file as a module
module.exports = AdminManager;

AdminManager.prototype.clone = function() {

    ngit.clone( PATH.STORAGE, GIT_REPO.GMKT, function(err, data ) {
        
        console.log( "clone: " + data );
    });
    
    ngit.clone( PATH.STORAGE, GIT_REPO.GMKT_BN, function(err, data ) {
    
        console.log( "clone: " + data );
    });
    
//    ngit.clone( PATH.WORK_REPO_GIT_ACT, GIT_REPO.ACT, function(err, data ) {
//        
//        console.log( "clone: " + data );
//    });
//    
//    ngit.clone( PATH.WORK_REPO_GIT_ACT_BN, GIT_REPO.ACT_BN, function(err, data ) {
//    
//        console.log( "clone: " + data );
//    });
}


AdminManager.prototype.getProfiles = function() {	return this.profiles; }

AdminManager.prototype.getReleaseProfiles = function() {	return this.releaseProfiles; }

AdminManager.prototype.getGroupProfiles = function() {	return this.groupProfiles; }

AdminManager.prototype.getProfile = function( profile ) {	return this.profilePool[ profile ]; }

AdminManager.prototype.getActivityProfiles = function() { return this.activityProfiles; }

AdminManager.prototype.getProfilePool = function() { return this.profilePool; }

AdminManager.prototype.getDevicePool = function() { return this.devicePool; }

AdminManager.prototype.getDevice = function( serial ) { return this.devicePool[ serial ]; }

AdminManager.prototype.setProfiles = function() {
	
	var data = storage.loadMetaProfilesSync();
	this.profiles = data;
	//this.activityProfiles = this.setActivityProfiles();
}

AdminManager.prototype.setReleaseProfiles = function() {
	
	var data = storage.loadMetaReleaseSync();
	this.releaseProfiles = data;
}

AdminManager.prototype.setGroupProfiles = function() {
	
	var data = storage.loadMetaGroupsSync();
	this.groupProfiles = data;
}
	
AdminManager.prototype.setActivityProfiles = function() {
	
	var profiles = this.profiles;
	for(profile in profiles) {
		
		if(!profiles[profile].activity)
			delete profiles[profile];	
	}
	
	return profiles;
}

AdminManager.prototype.setProfilePool = function() {
	//var list = this.activityProfiles;
	var list = this.profiles;
	var pool = new Object();
	for(name in list) {
		var pf = new Profile( this.main, list[name] );
		pool[name] = pf; 
	}
	
	return  pool;
}

AdminManager.prototype.setReleaseProfilePool = function() {
	//var list = this.activityProfiles;
	var list = this.releaseProfiles;
	var pool = new Object();
	for(name in list) {
		var pf = new Release( this.main, list[name] );
		pool[name] = pf; 
	}
	
	return  pool;
}

AdminManager.prototype.setGroupProfilePool = function() {
	//var list = this.activityProfiles;
	var list = this.groupProfiles;
	var pool = new Object();
	for(name in list) {
		var pf = new Group( this.main, list[name] );
		pool[name] = pf; 
	}
	
	return  pool;
}

AdminManager.prototype.addProfile = function(profile) {
	this.profiles[profile.name] = profile;
	var pf = new Profile( this.main, this.profiles[profile.name] );
	this.profilePool[profile.name] = pf;
};

AdminManager.prototype.addReleaseProfile = function(profile) {
	this.releaseProfiles[profile.name] = profile;
	var pf = new Release( this.main, this.releaseProfiles[profile.name] );
	this.releasePool[profile.name] = pf;
};

AdminManager.prototype.addGroupProfile = function(profile) {
	this.groupProfiles[profile.name] = profile;
	var pf = new Group( this.main, this.groupProfiles[profile.name] );
	this.groupPool[profile.name] = pf;
};

AdminManager.prototype.loadAllDevice = function(devices) {
	var list = devices;
	for(var i = 0; i < list.length; i++) {
		var serial = list[i];
		var d = new Device(this.main, serial);
		this.devicePool[serial] = d;
	}
};

AdminManager.prototype.loadDevice = function(devices) {
	
	for(var i = 0; i < devices.length; i++) {
		
		var serial = devices[i];
		if( finder.isKeyInObject(serial, this.devicePool) ) {
			var d = this.devicePool[serial];
			//de.log(TAG, d.getProductModel());
		} else {
			var d = new Device(this.main, serial);
			this.devicePool[serial] = d;
		} 
	}
}

AdminManager.prototype.clearDevicePool = function(devices) {
	if(devices.length > 0) {
		var list = finder.notExistedKeysInObject(devices, this.devicePool);
		for(var i = 0; i < list.length; i++) {
			var serial = list[i];
			de.log(TAG, 'disconnect device');
			delete this.devicePool[serial];
		}
	} else {
		for(serial in this.devicePool) {
			delete this.devicePool[serial];
		}
		de.log(TAG, 'all disconnect device');
	}
}

AdminManager.prototype.addSchedulers = function() {
	
	var deviceScheduler = new DeviceScheduler( null, INTERVAL_DEVICE_LIST );
	
	var _this = this;
	
	deviceScheduler.on('event', function( event, args ) {
		
		switch(event) {
			
			case DeviceScheduler.EVENT.START:
				de.log(TAG, 'add device scheduler');
			break;
			
			case DeviceScheduler.EVENT.RELOAD_DEVICE_LIST:
			
				_this.clearDevicePool( args.devices );
				
				if( finder.isEmptyInObject(_this.devicePool) ) 
					_this.loadAllDevice( args.devices );
				else
					_this.loadDevice( args.devices );
				
				_this.emit( 'event', event, args );
			break;
			
			default:
			break;
		}
	});

	deviceScheduler.start();
}

AdminManager.prototype.newProfile = function(config) {
	de.debug('config', config);
	var profile = PROFILE;
	profile.name = config.name;
	
	//	set config
	profile.config.domain = config.domain;
	profile.config.ersNo = config.ersNo;
	profile.config.branch = config.branch;
	profile.config.tag = config.tag;
	profile.config.type = "DR";
	profile.config.requester = "kim tae hi";
	profile.config.requestDate = new Date();
	profile.config.builder = "lee min jung";
	profile.config.buildDate = "-";
	profile.config.status = "-";
	
	//	set schedule
	profile.schedule.mins = config.mins.split(',');
	profile.schedule.hours = config.hours.split(',');
	profile.schedule.days = config.days.split(',');
	profile.schedule.weeks = config.weeks.split(',');
	profile.schedule.months = config.months.split(',');
	
	this.addProfile(profile);

	if( storage.saveMetaProfileSync(profile) ) {
		this.emit( 'evt_added_profile', this.profiles );
	} else {
		this.emit( 'evt_added_profile', null );
	}
    
    var workspace = '';
    
    if(config.domain == 'gmkt') {
        
        workspace = PATH.WORK_REPO_GIT_GMKT;
        
    } else if(config.domain == 'iac') {
        
        workspace = PATH.WORK_REPO_GIT_ACT;
    }
    
    var branch = config.branch;
    
    console.log("==========");
    console.log(config.branch, config.tag);
    
    ngit.addRBranch( PATH.WORK_REPO_GIT_GMKT, branch,  function( err, data ) {
        
        console.log( 'add remote branch: ' + data );
    });
}

AdminManager.prototype.newReleaseProfile = function(config) {
	de.debug('config', config);
	var profile = RELEASE_PROFILE;
	profile.name = config.name;
	
	//	set config
	profile.config.domain = config.domain;
	profile.config.ersNo = config.ersNo;
	profile.config.branch = config.branch;
	profile.config.tag = config.tag;
	profile.config.type = "DR";
	profile.config.requester = "kim tae hi";
	profile.config.requestDate = new Date();
	profile.config.status = "wait";
	profile.config.desc = config.desc;
	
	//	set schedule
	profile.schedule.mins = config.mins.split(',');
	profile.schedule.hours = config.hours.split(',');
	profile.schedule.days = config.days.split(',');
	profile.schedule.weeks = config.weeks.split(',');
	profile.schedule.months = config.months.split(',');
	
	this.addReleaseProfile(profile);

	if( storage.saveMetaReleaseProfileSync(profile) ) {
		this.emit( 'evt_added_release', this.releaseProfiles );
	} else {
		this.emit( 'evt_added_release', null );
	}
}

AdminManager.prototype.newGroupProfile = function(config) {
	de.debug('config', config);
	var profile = GROUP_PROFILE;
	profile.name = config.name;
	
	//	set config
	profile.name = config.name;
	profile.desc = config.desc;
	profile.server = config.list;
	
	this.addGroupProfile(profile);

	if( storage.saveMetaGroupProfileSync(profile) ) {
		this.emit( 'evt_added_group', this.groupProfiles );
	} else {
		this.emit( 'evt_added_group', null );
	}
}

AdminManager.prototype.deleteProfile = function(list) {
	
	for(var i = 0; i < list.length; i++) {
		delete this.profiles[ list[i] ];
	}
	
	if( storage.saveMetaProfilesSync(this.profiles) ) {
		this.emit( 'evt_deleted_profile', this.profiles );
	} else {
		this.emit( 'evt_deleted_profile', null );
	}
}

AdminManager.prototype.deleteReleaseProfile = function(list) {
	
	console.log("len: " + list.length);
	for(var i = 0; i < list.length; i++) {
		delete this.releaseProfiles[ list[i] ];
	}
	
	if( storage.saveMetaReleaseProfileSync(this.releaseProfiles) ) {
		this.emit( 'evt_deleted_release_profile', this.releaseProfiles );
	} else {
		this.emit( 'evt_deleted_release_profile', null );
	}
}

AdminManager.prototype.editProfile = function(data) {
	
	var name = data.name;
	//this.profiles[name] = name;

	this.profiles[name].config.event = Number(data.config.event);
	this.profiles[name].config.count = Number(data.config.count);
	this.profiles[name].config.seed_start = Number(data.config.seed_start);
	this.profiles[name].config.seed_end = Number(data.config.seed_end);
	this.profiles[name].config.seed_interval = Number(data.config.seed_interval);
	this.profiles[name].config.throttle = Number(data.config.throttle);
	
	this.profiles[name].schedule = data.schedule;
	
	if( storage.saveMetaProfilesSync(this.profiles) ) {
		this.emit( 'evt_edited_profile', this.profiles );
	} else {
		this.emit( 'evt_edited_profile', null );
	}
}

AdminManager.prototype.doRun = function( data, isSave ) {
	de.log(TAG, data, isSave);
	
	for( key in data ) {
		var profile = this.getProfile( key );
		var devices = data[key].target;
		
		if(isSave)
			profile.save( data[key] );
			
		profile.makeNowJobs( devices );
	}
}


AdminManager.prototype.getSourceList = function( domain ) {
    
    var path = "";
    
    if( domain == '') {
        path = PATH.WORK_REPO_GIT_GMKT;
    } else {
        path = PATH.WORK_REPO_GIT_ACT;
    }
    
    ffilter.xml( path, 'xml', function( err, data ) {
        
        this.emit( 'evt_source_lsit', data );
    });
}

AdminManager.prototype.getBinaryList = function( domain ) {
    
    var path = "";
    
    if( domain == '') {
        path = PATH.WORK_REPO_GIT_GMKT_BN;
    } else {
        path = PATH.WORK_REPO_GIT_ACT_BN;
    }
    
    ffilter.xml( path, 'xml', function( err, data ) {
        
        this.emit( 'evt_binary_lsit', data );
    });
}
















