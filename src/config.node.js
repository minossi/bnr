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





var path 					= require('path');

PORT						= '8090';
NAME_STORAGE 				= 'db';
NAME_LOG					= 'log';
NAME_DATA					= 'data';

VERSION_PROFILE_LIST 		= '0.1.0';
DESCRIPTION_PROFILE_LIST 	= 'ACTS meta profiles infomation using json syntax';
VERSION_LOG 				= '0.1.0'
INTERVAL_DEVICE_LIST 		= 5  * 1000;
INTERVAL_ALARM 				= 10 * 1000;
INTERVAL_SYSTEM_LOG 		= 1000;


/*
 *  for EBay
 */

META_PROFILE     			= 'meta_profiles.json';
META_RELEASE_PROFILE 		= 'meta_release_profiles.json';
META_GROUP_PROFILE 			= 'meta_group_profiles.json';
NAME_GMKT                   = 'gmkt';
NAME_ACT                    = 'act';


GIT_REPO = {
    GMKT:   "ssh://10.0.1.5:29419/gmkt/st/Admin.git gmkt/st",
    ACT:    "ssh://10.0.1.5:29419/gmkt/st/Admin.git iac/st",
    GMKT_BN:"ssh://10.0.1.5:29419/gmkt/rt/Admin.git gmkt/rt",
    ACT_BN: "ssh://10.0.1.5:29419/gmkt/st/Admin.git iac/rt",
};
// end for EBay


G_MAIN = new Object();	// main global

PATH = {
    
	HOME:process.cwd(),
	STORAGE:path.join(process.cwd(), NAME_STORAGE),
	LOG:path.join(process.cwd(), NAME_STORAGE, NAME_LOG),
	DATA:path.join(process.cwd(), NAME_STORAGE, NAME_DATA),
	META_PROFILE:path.join(process.cwd(), NAME_STORAGE, META_PROFILE),
	META_RELEASE_PROFILE:path.join(process.cwd(), NAME_STORAGE, META_RELEASE_PROFILE),
	META_GROUP_PROFILE:path.join(process.cwd(), NAME_STORAGE, META_GROUP_PROFILE),
    WORK_REPO_GIT_GMKT: path.join( process.cwd(), NAME_STORAGE, "gmkt", "st"),
    WORK_REPO_GIT_ACT: path.join( process.cwd(), NAME_STORAGE, "iac", "st"),
    WORK_REPO_GIT_GMKT_BN: path.join( process.cwd(), NAME_STORAGE, "gmkt", "rt"),
    WORK_REPO_GIT_ACT_BN: path.join( process.cwd(), NAME_STORAGE, "iac", "rt"),
    WORK_REPO_GIT_GMKT_LOG: path.join( process.cwd(), NAME_STORAGE, "gmkt", "rt", "log"),
    WORK_REPO_GIT_ACT_LOG: path.join( process.cwd(), NAME_STORAGE, "iac", "rt", "log"),
    BGIT: path.join( process.cwd(), "src", "adb", "bgit.sh"),
    MULTIGIT: path.join( process.cwd(), "src", "adb", "multimodule.sh")
};

PROFILE_LIST = {
    version: VERSION_PROFILE_LIST,
	description: 'ACTS meta profiles infomation using json syntax',
	profiles: {
		
	}
};

PROFILE = {
	name: '',
	activity: true,
	mail: {
		to: "",
		cc: "",
		bcc: "",
		activity: true
	},
	config: {
		seqNo: 0,
		domain: "itempage3",
		ersNo: 3000,
		branch: "bc_3000_001",
		tag: "REL_3000_001",
		type: "DR",
		requester: "김태희",
		requestDate: "2012-04-05",
		builder: "이민정",
		status: "빌드완료",
		buildDate: "2012-04-08"
	},
	target: {
	},
	schedule: {
		mins:[],
		hours:[],
		days:[],
		weeks:[],
		months:[]
	}
}

REALEASE_HISTORY = {
	date: "2012-04-05",
	who: "서태지",
	what: [
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp"
	],
	type: "스테이징 배포"
}

RELEASE_PROFILE_LIST = {
    version: VERSION_PROFILE_LIST,
	description: 'ACTS meta profiles infomation using json syntax',
	profiles: {
		
	}
};

GROUP_PROFILE_LIST = {
    version: VERSION_PROFILE_LIST,
	description: 'ACTS meta profiles infomation using json syntax',
	profiles: {
	}
};

GROUP_PROFILE = {
	name: 'auction',
	desc: '',
	activity: true,
	server: [
	],
	client: [
	]
}



RELEASE_PROFILE = {
	name: '',
	activity: true,
	mail: {
		to: "",
		cc: "",
		bcc: "",
		activity: true
	},
	config: {
		seqNo: 0,
		domain: "itempage3",
		ersNo: 3000,
		branch: "bc_3000_001",
		tag: "REL_3000_001",
		type: "DR",
		requester: "이민정",
		requestDate: "",
		status: "",
		desc: ""
	},
	history: [
		REALEASE_HISTORY
	],
	target: {
	},
	schedule: {
		mins:[],
		hours:[],
		days:[],
		weeks:[],
		months:[]
	}
}



DUMMY_SOURCE_LIST = {
	source: [
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp"
	],
	binary: [
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp",
		"a.asp"
	]
};

DUMMY_SERVER_LIST = {
	builder: [
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243"
	],
	tester: [
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243"
	],
	staging: [
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243"
	],
	release: [
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243",
		"172.30.136.243"
	]
};

DEVICE_LIST = {
	version: VERSION_PROFILE_LIST,
	description: "ACTS meta device infomation using json syntax",
	devices: []
};

APPLICATION_LIST = {
	version: VERSION_PROFILE_LIST,
	description: "ACTS meta application infomation using json syntax",
	applications: []
};

PROFILE_LOG = {
	version: VERSION_LOG,
	description: 'profile log list',
	histories: []
};

HISTORY = {
	version: VERSION_LOG,
	description: 'profile history data',
	startTime: '2011_05_06T23:59:59',
	target: {
		serial: '',
		model: ''
	},
	app:[
	],
	pass: 0,
	fail: 0,
	status: 'done or abort' 
};

SUMMARY_DAY = {
	version: VERSION_LOG,
	description: 'day summary file',
	targets:{},
	applications:{}
};

SUMMARY_JOB = {
	version: VERSION_LOG,
	description: 'job summary file',
	profile: 'standard',
	target: '',
	status: 'abort or done',
	startTime: '2011_05_06T23:59:59',
	endTime: '2011_05_06T23:59:59',
	duration: '00:00:00',
	passCount: 0,
	failCount: 0,
	rate: 100,
	monkeys: [],
	systems:[]
};

MONKEY = {
	startTime: '',
	endTime: '',
	duration:'',
	seed: 0,
	pass: false
};

SYSTEM = {
	cpu:[[]],
	memory:[[]],
	network:[[],[]]
};

MAIL = {
	host: 'smtp.gmail.com',
	port: 587,
	ssl: false,
	use_authentication: true,
	user: 'example@gmail.com',
	pass: '********'
};





