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

var mClients = {};

var mGroups = {};

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
	
	//requestServerList();
	requestGroupList();
});

function onClickMake() {
	
	var sn = $('input[name=serverName]:checked').val();

	var tsn = "";
	if(sn) 
		tsn = replaceAll( sn , "/", "");
	console.log( "1: " + sn );
	var list = selectedClient();
	
	var name = $("#group_name").val();
	var desc = $("#group_desc").val();
	
	$.ajax({
		cache: false,
		type: "POST",
		url: "/request_admin_new_group",
		dataType: "json",
		data: JSON.stringify({
			server: tsn,
			clients: list,
			name:name,
			desc: desc
		}),
		error: function () {

		},
		success: function (data) {
			console.log(data);
			mGroups = data.groups;
			mClients = data.clients;
			createGroupList();
		}
	});
}

function onClickDelete() {
	
	var list = selectedGroup();

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
			mGroups = data;
			createGroupList( data );
		}
	});
}

function replaceAll(str, orgStr, repStr) {

	var result = str.split(orgStr).join(repStr);
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

/*
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
*/

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
			mClients = data.clients;
			mGroups = data.groups;
			createGroupList();
		}
	});
}

function createGroupList() 
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
	
	for(var k in mGroups){
		
		var group = mGroups[k];
		var serverName = group.server;
		console.log("1:    " + serverName);
		thead += "<tr><td width='10%'>";
		thead += "<input type='checkbox' name='groupName' id='groupName_" + k + "' value="+ k + "/>";
		thead += "</td><td>";
		
		for( var m in mClients) {
			console.log("-->" + m);
			if( serverName == m ) {
				thead += "" + mClients[m].fqn;
			}
		}
		
		thead += "</td><td>"
		thead += "<a href='#' onclick=onClickProfile('"+ k +"');>" + k + "</a>";
		thead += "</td><td>";
		thead += mGroups[k]["desc"];
		thead += "</td>"
		thead += "</tr>";
		
		i++;
	}
	
	thead += "</table>"
	
	$("#group_list").empty();
	$("#group_list").append(thead);
	
	createServerList();
}

function onClickProfile( name )
{
	var server = mGroups[name].server;
	var clients = mGroups[name].client;
	
	var elemServer = '';
	var elemClient = '';
	/*
	for( var i = 0; i < servers.length; i++ ) {
		
		var key = servers[i];
		
	for( var k in mClients) {

		if( server == k )
			elemServer += "<tr><td td width='100%'>" + mClients[k].fqn + '</td></tr>';
	}
	}
	*/
	for( var j = 0; j < clients.length; j++ ) {
		
		var key = clients[j];
		
		for( var k in mClients) {

			if( key == k )
				elemClient += "<tr><td width='100%'>" + mClients[k].fqn + '</td></tr>';
		}
	}
	
	$('#monitor_client_view').empty();
	$('#monitor_client_view').append(elemClient);
}

function onClickCheck( form ) 
{
	var v = form.value;
	console.log( v );
}

function checkServerList(key)
{
	var result = false;
	
	for(var group in mGroups) {
		
		var serverKey = mGroups[group].server;
		
		if(serverKey == key)
			result = true;
		
	}
	
	return result;
}

function createServerView()
{
	var elem = "";
	
	var isExisted = false;
	for(var key in mClients)
	{
		var result = checkServerList(key);
		
		if(!result && mClients[key].mode == "server") {
			elem += "<input type='radio' name='serverName' id='serverName' value='" + key +"'/>";
			elem += mClients[key].fqn;
			elem += "<br/>";
		}
		
	}

	$("#server_list").empty();
	$("#server_list").append(elem);
}

function checkClientsList(key)
{
	var result = false;
	
	for(var group in mGroups) {
		
		var clientList = mGroups[group].client;
		
		for(var i = 0; i < clientList.length; i++) {
			
			if(clientList[i] == key)
				result = true;
		}
	}
	
	return result;
}

function createClientView()
{
	var client = "";
	console.log(mClients);
	console.log(mGroups);
	
	for(var key in mClients)
	{
		var result = checkClientsList( key );
		console.log("result: " + result);
		if(!result && mClients[key].mode == "client") {
			client += "<input type='checkbox' name='clientName' id='clientName_" + key + "' value="+ key + "/>";
			client += mClients[key].fqn;
			client += "<br/>";
		}
	}

	$("#client_list").empty();
	$("#client_list").append(client);
}

function createServerList()
{
	createServerView();
	createClientView();
	$("#monitor_client_view").empty();
	$("#group_name").val("");
	$("#group_desc").val("");
}
















