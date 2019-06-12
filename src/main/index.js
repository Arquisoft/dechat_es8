'use strict'

const auth = require("solid-auth-client");
const {
  default: data
} = require('@solid/query-ldflex');
const Core = require('../lib/core');

let userWebId;
let core = new Core(auth.fetch);
let refreshIntervalIdInbox;

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
    
    // refresh every 4sec
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
