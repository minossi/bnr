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

var mClients={};

var mCurrentUID;

var mData = null;

$(document).ready(function () {
	
	var btnElem = "<table border='0px' width='100%'>";
	btnElem += "<tr>";
	btnElem += "<td>그룹 이름</td>";
	btnElem += "</tr>";
	btnElem += "<tr><td>"
	btnElem += "<input style='width:98%' type='text' name='group_name' maxlength='30' id='group_name' value=''/>";
	btnElem += "</td></tr>"
	btnElem += "<tr>";
	btnElem += "<td>설명</td>";
	btnElem += "</tr>";
	btnElem += "<tr>"
	btnElem += "<td>"
	btnElem += "<textarea name='group_desc' id='group_desc' style='width:98%' rows='4' cols='30'/>";
	btnElem += "</td>"
	btnElem += "</tr>"
	btnElem += "<tr>"
	btnElem += "<td align='right'>"
	btnElem += "<button style='width:100px' type='button' onclick='onClickMake()'>생성</button>";
	btnElem += "<button style='width:100px' type='button' onclick='onClickDelete()'>Delete</button>";
	btnElem += "</td>"
	btnElem += "</tr>"
	btnElem += "</table><hr>";
	
	$("#group_top").empty();
	$("#group_top").append(btnElem);
	
	requestServerList();
	requestGroupList();
});

function onClickMake() {
	
	var list = selectedServer();
	var list2 = selectedClient();
	
	var name = $("#group_name").val();
	var desc = $("#group_desc").val();
	
	$.ajax({
		cache: false,
		type: "POST",
		url: "/request_admin_new_group",
		dataType: "json",
		data: JSON.stringify({
			servers: list,
			clients: list2,
			name:name,
			desc: desc
		}),
		error: function () {

		},
		success: function (data) {
			console.log(data);
			mData = data;
			createGroupList( data );
		}
	});
}

function onClickDelete() {
	
	var list = selectedGroup();
	console.log("=========");
	console.log(list);
	$.ajax({
		cache: false,
		type: "POST",
		url: "/request_admin_delete_group",
		dataType: "json",
		data: JSON.stringify({
			list:list
		}),
		error: function () {

		},
		success: function (data) {
			mData = data;
			createGroupList( data );
		}
	});
}

function replaceAll(str, orgStr, repStr) {

	var result = str.split(orgStr).join(repStr);
	//console.log(result);
	return result;

}

function selectedServer() {

	 var list = new Array();

	 $("input[name='serverName']:checkbox:checked").each(function(){
													list.push(replaceAll($(this).val(), '/', ''));
													});	

	return list;
}

function selectedClient() {

	 var list = new Array();

	 $("input[name='clientName']:checkbox:checked").each(function(){
													list.push(replaceAll($(this).val(), '/', ''));
													});	

	return list;
}
function selectedGroup() {

	 var list = new Array();

	 $("input[name='groupName']:checkbox:checked").each(function(){
													list.push(replaceAll($(this).val(), '/', ''));
													});	

	return list;
}


function requestServerList() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_server_list",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			mClients = data;
			createServerList( mClients );
		}
	});
}

function requestGroupList() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_group_list",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
			mData = data;
			createGroupList( data );
		}
	});
}

function requestJobList() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_job_list",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
			refreshJobProcess( data );
			requestJobProcess();
		}
	});
}

function requestJobProcess() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_job_process",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
				
			refreshJobProcess( data );
			requestJobProcess();
		}
	});
}

function requestStopAll() {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_stop_all",
		dataType: "json",
		data: {
			
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
		}
	});
}

function requestStop( index, serial ) {
	
	 $.ajax({
		cache: false,
		type: "GET",
		url: "/request_admin_stop",
		dataType: "json",
		data: {
			index: index,
			serial: serial
		},
		error: function () {

		},
		success: function ( data ) {
			console.log( data );
		}
	});
}

function createGroupList( data ) 
{
	var thead = "<table width='100%' border='1px'><thead>";
	thead += "<tr>"; 
	thead += "<th scope='col'>No.</th>";
	thead += "<th scope='col'>Server</th>";
	thead += "<th scope='col'>Name</th>";
	thead += "<th scope='col'>설명</th>";
	thead += "</tr>";
	thead += "</thead>";

	var i = 0; 
	
	for(var k in data){
		
		var group = data[k];
		var servers = group.server;
		thead += "<tr><td width='10%'>";
		thead += "<input type='checkbox' name='groupName' id='groupName_" + k + "' value="+ k + "/>";
		thead += "</td><td>";
		
		if(servers.length > 0) {
			
			var key = servers[0];
			
			for( var m in mClients) {

			if( key == m )
				mClients[m].fqn;
			}
		}
		
		thead += "</td><td>"
		thead += "<a href='#' onclick=onClickProfile('"+ k +"');>" + k + "</a>";
		thead += "</td><td>";
		thead += data[k]["desc"];
		thead += "</td>"
		thead += "</tr>";
		
		i++;
	}
	
	thead += "</table>"
	
	$("#group_list").empty();
	$("#group_list").append(thead);
}

function onClickProfile( name )
{
	var servers = mData[name].server;
	var clients = mData[name].client;
	
	var elemServer = '';
	var elemClient = '';
	
	for( var i = 0; i < servers.length; i++ ) {
		
		var key = servers[i];
		
		for( var k in mClients) {

			if( key == k )
				elemServer += "<tr><td td width='100%'>" + mClients[k].fqn + '</td></tr>';
		}
	}
	
	for( var j = 0; j < clients.length; j++ ) {
		
		var key = clients[j];
		
		for( var k in mClients) {

			if( key == k )
				elemClient += "<tr><td width='100%'>" + mClients[k].fqn + '</td></tr>';
		}
	}
	
	
	$('#monitor_server_view').empty();
	$('#monitor_server_view').append(elemServer);
	
	$('#monitor_client_view').empty();
	$('#monitor_client_view').append(elemClient);
}

function refreshJobProcess( data )
{	
	var parent = $("#device_list").parent();
	$("#device_list").remove();
	parent.append("<div id='device_list' />");
	
	var btnElem = "<table border='0px' width='100%'>";
	btnElem += "<tr>";
	btnElem += "<td>그룹 이름</td>";
	btnElem += "</tr>";
	btnElem += "<tr><td>"
	btnElem += "<input style='width:98%' type='text' name='event' maxlength='30' id='group_name' value=''/>";
	btnElem += "</td></tr>"
	btnElem += "<tr>";
	btnElem += "<td>설명</td>";
	btnElem += "</tr>";
	btnElem += "<tr>"
	btnElem += "<td>"
	btnElem += "<textarea style='width:98%' rows='4' cols='30'/>";
	btnElem += "</td>"
	btnElem += "</tr>"
	btnElem += "<tr>"
	btnElem += "<td align='right'>"
	btnElem += "<button style='width:100px' type='button' onclick='onClickAllStop()'>생성</button>";
	btnElem += "</td>"
	btnElem += "</tr>"
	btnElem += "</table><hr>";
	
	$("#group_list").append(btnElem);

	var elem = '<div style="height:680px;width:50%px;overflow:auto;">';
	elem += "<table border='1px' width='100%'>";
	elem += "<thead><tr>";
	elem += "<th scope='col'></th>";
	elem += "<th scope='col'>Name</th>";
	elem += "<th scope='col'>IP Address</th>";
	elem += "<th scope='col'>Desc</th>";
	//elem += "<th scope='col' colspan='2'>Process</th>";
	elem += "<tr></thead>";
	
	for(var key in data) {
		var process = data[ key ];
		
		for(var i = 0; i < process.length; i++) {
			
			elem += '<tr>';
			if( process[ i ].model == "" )
				elem += '<td>' + "Unknown" + "</td>";
			else
				elem += '<td>' + process[ i ].model + "</td>";
			
			if( i == 0 )
				elem += '<td>' + "<a href='#' onclick='onClickDevice("+ '"' + process[ i ].serial + '"' + ',' + '"' + process[ i ].uid + '"' + ")'>" + process[ i ].serial + "</a></td>";
			else
				elem += "<td>" + process[ i ].serial + "</td>";
				
			elem += '<td>' + process[ i ].profile + "</td>";
			elem += '<td>' + process[ i ].app[ 0 ] + "</td>";


			if( i  == 0) {
				elem += '<td>' + ( process[ i ].monkeyIndex + 1 ) + '/' + process[ i ].monkeyCount + "</td>";
				elem += "<td>" + "<a href='#' onclick='onClickStop("+ '"' + i +'"' + "," + '"' + process[ i ].serial +'"' + ")'>stop</a></td>";
			} else {
				elem += '<td>' + '0' + '/' + process[ i ].monkeyCount + "</td>";
				elem += '<td>' + 'pending' + "</td>";
			}
			elem += '</tr>';
		}
	}

	elem += '</table>';
	elem += '</div>';

	$("#device_list").append(elem);
}

function createServerList( data )
{
	var server = "";
	var client = "";
	
	for(var k in data)
	{
		var agent = data[k];
		
		if(agent.mode=="server") {
			server += "<input type='checkbox' name='serverName' id='serverName_" + k + "' value="+ k + "/>";
			server += agent.fqn;
			server += "<br/>";
		} else {
			client += "<input type='checkbox' name='clientName' id='clientName_" + k + "' value="+ k + "/>";
			client += agent.fqn;
			client += "<br/>";
		}
	}
	 
	$("#server_list").empty();
	$("#server_list").append(server);
	
	$("#client_list").empty();
	$("#client_list").append(client);
}

function onClickStop( index, serial )
{
	requestStop( index, serial );
}

function onClickAllStop()
{
	requestStopAll();
}

function onClickDevice( serial, uid )
{
	console.log( serial );
	mCurrentUID = uid;
	
	createSystemGraph();
	
	for(var i = 0; i < GRAPH_EMITTER.length; i ++) {
		requestMonitoringSystem( serial, GRAPH_EMITTER[ i ] );
	}
}













