'use strict'

const auth = require("solid-auth-client");
const {
  default: data
} = require('@solid/query-ldflex');
const Core = require('../lib/core');
const DataSync = require('../lib/datasync');

let userWebId;
let core = new Core(auth.fetch);
let dataSync = new DataSync(auth.fetch);
let refreshIntervalIdInbox;
let friendWebId;
let userDataUrl;
let friendMessages = [];
let openChat=false;
let newMessageFound=false;

auth.trackSession(async session => {
  const loggedIn = !!session;

  if (loggedIn) {
    seeChatScreen();
    userWebId = session.webId;
      
    if (userWebId) {
    let n=0;
    for await (const friend of data[userWebId].friends) {
        let name = await core.getFormattedName(friend.value);
        let id="friend"+n;
        
        $("#friends").append(`<button type="button" id="${id}" class="list-group-item list-group-item-action" value="${friend}" text="${name}">${name}</button>`);
        document.getElementById("friend" + n).addEventListener("click", loadChat, false);
        n=n+1;
    }
  }
    
    checkForNotificationsInbox();
    
    // refrescar cada 4 segundos
    refreshIntervalIdInbox = setInterval(checkForNotificationsInbox, 4000);
  } else {
    seePrincipalScreen();
    userWebId = null;
    clearInterval(refreshIntervalIdInbox);
    refreshIntervalIdInbox = null;
  }
});

$("#login-btn").click(() => {
  auth.popupLogin({ popupUri: "https://solid.github.io/solid-auth-client/dist/popup.html" });
});

$("#logout-btn").click(() => {
	auth.logout();
    clearConver();
    deleteFriends();
    seePrincipalScreen();
});

function seeChatScreen() {
	$("#footer").hide();
	$("#principalScreen").hide(); 
    $("#chatScreen").show();
}

function seePrincipalScreen() {
 $("#principalScreen").show(); 
    $("#footer").show();
    $("#chatScreen").hide();
}

function deleteFriends(){
    var element = document.getElementById("friends");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function clearConver(){
    $("#friend-name").text("");
    var element = document.getElementById("conver");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function loadChat() {  
    clearConver();
	//Attribute text es el nombre formateado del amigo
	const dataUrl = core.getDefaultDataUrl(userWebId)+this.getAttribute("text");
	//Attribute value es el webid del amigo
    friendWebId = this.getAttribute("value");
    userDataUrl = dataUrl;
    setUpChat();
}

async function checkForNotificationsInbox() {
	  var updates = await core.checkUserForUpdates(await core.getUrl(userWebId,"inbox/"));
	  
	  updates.forEach(async (fileurl) => {   
		  let message = await core.getNewMessage(fileurl,"/inbox/", dataSync,);
		  console.log(message);  
		  if (message) {
				newMessageFound = true;
				if (openChat) {
					addMessage(await core.getFormattedName(friendWebId),message.messageTx,false);
				} else {
					message.date=message.date.split("/").pop();
					friendMessages.push(message);
				}
			} 
	  });
}

async function checkForNotificationsPublic() {
	//Reemplaza espacios por %20
  const psFriendname = (await core.getFormattedName(friendWebId)).replace(/ /g,"%20");
  var updates = await core.checkUserForUpdates(await core.getUrl(userWebId, "public/")+"/chat_"+psFriendname);
  updates.forEach(async (fileurl) => {   
      let message = await core.getNewMessage(fileurl,"/public/chat_"+await psFriendname+"/", dataSync);
      console.log(message);
      if (message) {
      newMessageFound = true;
      message.date=message.date.split("/").pop();
			friendMessages.push(message);
		} 
  });
}

async function setUpChat() {
    const friendName = await core.getFormattedName(friendWebId);
    const userName=await core.getFormattedName(userWebId);
    $("#friend-name").text(friendName);
	//userDataUrl es la url .../public/chat_**nombre del amigo**
    core.createChatFolder(userDataUrl);
    checkForNotificationsPublic();
    var i = 0; 
	
    friendMessages.sort(function(a, b) {
      return parseFloat(a.date) - parseFloat(b.date);
	});
	
	while (i < friendMessages.length) {
		var nameThroughUrl = friendMessages[i].author.split("/").pop();
		var friendThroughUrl = friendMessages[i].friend.split("/").pop();
		if (nameThroughUrl === friendName && friendThroughUrl===userName) {
			addMessage(friendName,friendMessages[i].messageTx,false);
		}
		else if (nameThroughUrl === userName && friendThroughUrl===friendName) {
		  addMessage(userName,friendMessages[i].messageTx,true);
		}
		i++;
	}
	openChat = true;
}

$("#write-chat").click(async() => {
    const message=$("#message").val();
    addMessage(await core.getFormattedName(userWebId),message,true);
	document.getElementById("message").value="";
	await core.storeMessage(userDataUrl, await core.getFormattedName(userWebId), message, friendWebId, dataSync, true);
});

function addMessage(user,message,sended){
    var toAdd="";
    if(sended===true){
        toAdd="<div class='d-flex flex-row-reverse bd-highlight'><div id='right'><h5><span class='badge badge-light'>"+message+"</span></h5><h6><span class='badge badge-primary'>"+user+"</span></h6></div></div>";
    }else{
        toAdd="<div class='d-flex flex-row bd-highlight'><div id='left'><h5><span class='badge badge-light'>"+message+"</span></h5><h6><span class='badge badge-primary'>"+user+"</span></h6></div></div>";
    }
    $("#conver").append(toAdd);
}
