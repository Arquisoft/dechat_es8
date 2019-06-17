require('chai');
var assert = require('assert');
const auth = require('solid-auth-client');

const Core = require("../src/lib/core");
const core = new Core(auth.fetch);

const namespaces = require("../src/lib/namespaces");

const DataSync=require("../src/lib/datasync");
const datasync=new DataSync(auth.fetch);

const rdf = require('../src/lib/rdfjssourcefactory');

describe("core test", function () {
	it("name of a solid url", function() {
		core.getFormattedName("https://cristiansoyyo.solid.community/profile/card#me").then(r=>{assert(r, "Cristian_soy_yo");});
	});
	
	it("getObjectFromPredicateForResource", function() {
		core.getObjectFromPredicateForResource("https://cristiansoyyo.solid.community/profile/card#me",namespaces.test);
	});
	
	it("checkUserForUpdates", function() {
		core.checkUserForUpdates("https://cristiansoyyo.solid.community/inbox/").then(r=>{assert(r, "Promise { <pending> }");});
	});
	
	it("default url for a chat", function () {
		assert(core.getDefaultDataUrl("https://cristiansoyyo.solid.community/profile/card#me"),"https://cristiansoyyo.solid.community/public/chat_");
	});
	
	it("createChatFolder", function () {
		assert(core.createChatFolder("https://cristiansoyyo.solid.community/public/chat_"),true);
	});
	
	it("get url with a profile and a directory", function () {
		core.getUrl("https://cristiansoyyo.solid.community/profile/card#me", "public/").then(r=>{assert(r,"https://cristiansoyyo.solid.community/public/");});
		core.getUrl("https://cristiansoyyo.solid.community/profile/card#me", "inbox/").then(r=>{assert(r,"https://cristiansoyyo.solid.community/inbox/");});
	});
	
	it("storeMessage", function() {
        let result=core.storeMessage("https://alejandrosanz.solid.community/public/chat_Malu","Alejandro","Muy buenas","https://malu.solid.community/inbox",
			datasync, true);    
        assert(result, true);
    });
	
	it("generateUniqueUrlForResource", function() {
		core.generateUniqueUrlForResource("cristianTest").then(r=>{assert(r, "cristianTest#");});
	});
	
	it("getNewMessage", function() {
        let r=core.getNewMessage("https://alejandrosanz.solid.community/inbox/14532d20-594d-11e9-b3ac-bb6f656d2471.txt", "/inbox/");
        assert(r, null);
	});
});