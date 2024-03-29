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
	
	it("name of a fail url", function() {
		rdf.fromUrl("hola",core.fetch).then(r=>{assert(r, null);});
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
        let result=core.storeMessage("https://cristiansoyyo.solid.community/public/chat_Hulio","Cristian_soy_yo","Muy buenas",
			"https://hulio.solid.community/profile/card#me",datasync, true);    
        assert(result, true);
    });
	
	it("generateUniqueUrlForResource", function() {
		core.generateUniqueUrlForResource("cristianTest").then(r=>{assert(r, "cristianTest#");});
	});
	
	it("getNewMessage", function() {
        let r=core.getNewMessage("https://hulio.solid.community/inbox/f9a617f0-9194-11e9-8ec1-dfd1f81cd905", "inbox/");
        assert.equal(r.resolves, undefined);
	});
});

describe("dataSync tests", function () {
	it("createEmptyFileForUser", function () {
		datasync.createEmptyFileForUser("https://cristiansoyyo.solid.community/inbox/testCreateEmptyFile.txt").then(r=>{assert(r.url,
		"https://cristiansoyyo.solid.community/inbox/testCreateEmptyFile.txt");});
	});
    
	it("deleteFileForUser", function () {
		datasync.deleteFileForUser("https://cristiansoyyo.solid.community/inbox/testCreateEmptyFile.txt").then(r=>{assert(r.url,
		"https://cristiansoyyo.solid.community/inbox/testCreateEmptyFile.txt");});
	});

});