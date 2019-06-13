'use strict'

const auth = require("solid-auth-client");
const {
  default: data
} = require('@solid/query-ldflex');
const Core = require('../lib/core');

let userWebId;
let core = new Core(auth.fetch);
let refreshIntervalIdInbox;
let friendWebId;
let userDataUrl;

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
	const dataUrl = core.getDefaultDataUrl(userWebId)+this.getAttribute("text");
    friendWebId = this.getAttribute("value");
    userDataUrl = dataUrl;
    setUpChat();
}

async function checkForNotificationsInbox() {
	  var updates = await core.checkUserForUpdates(await core.getInboxUrl(userWebId));
	  
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
  const psFriendname = (await core.getFormattedName(friendWebId)).replace(/ /g,"%20");
  var updates = await core.checkUserForUpdates(await core.getPublicUrl(userWebId)+"/chat_"+psFriendname);
  updates.forEach(async (fileurl) => {   
      let message = await messageManager.getNewMessage(fileurl,"/public/chat_"+await psFriendname+"/", dataSync);
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
