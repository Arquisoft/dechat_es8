const namespaces = require("./namespaces");
//Sirve para poder trabajar con Promises
const Q = require("q");
//Sirve para hacer consultas SPARQL
const newEngine = require("@comunica/actor-init-sparql-rdfjs").newEngine;
const rdfjsSourceFromUrl = require("./rdfjssourcefactory").fromUrl;
//Librería para trabajar con URLs
const URI = require("uri-js");
//Sirve para manejar archivos en almacenes Solid
const fileClient = require("solid-file-client");
//Crea un id único con la fecha, el proceso y el nombre de la máquina
const uniqid = require("uniqid");

class DeChatCore {
	
  constructor(fetch) {
    this.inboxUrls = {};
    this.fetch = fetch;
    this.alreadyCheckedResources = [];
  };
  
  async getFormattedName(webid) {
    let formattedName = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + "name");
     if (!formattedName) {
      formattedName = null
      const firstname = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + 'givenName')
      const lastname = await this.getObjectFromPredicateForResource(webid, namespaces.foaf + 'lastName')

      if (firstname) {
        formattedName = firstname
      }

      if (lastname) {
        if (formattedName) {
          formattedName += ' '
        } else {
          formattedName = ''
        }

        formattedName += lastname
      }

      if (!formattedName) {
        formattedName = webid
      }
    } else {
      formattedName = formattedName.value
    }

    return formattedName;
  }
  
  async getObjectFromPredicateForResource(url, predicate) {
    const deferred = Q.defer()
    const rdfjsSource = await rdfjsSourceFromUrl(url, this.fetch)

    if (rdfjsSource) {
      const engine = newEngine()

      engine.query(`SELECT ?o {
    <${url}> <${predicate}> ?o.
  }`, {
        sources: [{
          type: 'rdfjsSource',
          value: rdfjsSource
        }]
      }).then(function (result) {
          result.bindingsStream.on('data', function (data) {
            data = data.toObject()

            deferred.resolve(data['?o'])
          })

          result.bindingsStream.on('end', function () {
            deferred.resolve(null)
          })
        })
    } else {
      deferred.resolve(null)
    }

    return deferred.promise
  }
  
  async checkUserForUpdates(inboxUrl) {
    const deferred = Q.defer();
    const newResources = [];
    const engine = newEngine();
    const rdfjsSource = await rdfjsSourceFromUrl(inboxUrl, this.fetch);   
    engine.query(`SELECT ?resource {
      ?resource a <http://www.w3.org/ns/ldp#Resource>.
    }`,
      { sources: [ { type: "rdfjsSource", value: rdfjsSource } ] })
      .then(function (result) {
        result.bindingsStream.on("data", data => {
          data = data.toObject();

          const resource = data['?resource'].value;

          if (alreadyCheckedResources.indexOf(resource) === -1) {
            newResources.push(resource);
            alreadyCheckedResources.push(resource);
          }
        });

        result.bindingsStream.on("end", function () {
          deferred.resolve(newResources);
        });
      });

    return deferred.promise;
  }
  
  getDefaultDataUrl(webId) {
    const parsedWebId = URI.parse(webId);

    return  `${parsedWebId.scheme}://${parsedWebId.host}/public/chat_`;
  }
  
  async createChatFolder(url) {
	return await fileClient.createFolder(url).then( (success) => {
		return true;
	}, err => {
		return false;
	});
  }
  
  async getUrl(webId, directory) {
    var sub=webId.substring(0,webId.length-15);
    var a=sub +directory;
    this.inboxUrls[webId]=a;
    return this.inboxUrls[webId];
  }
  
  async storeMessage(userDataUrl, username, message, friendWebId, dataSync, toSend) {
		var friendName=await this.getFormattedName(friendWebId);
		const messageTx = message.replace(/ /g,"U+0020");
		const psUsername = username.replace(/ /g,"U+0020");
		const psFriendname = friendName.replace(/ /g,"U+0020");
		const url = userDataUrl.replace(/ /g,"_");
		const date = (new Date()).getTime();

		const messageUrl = await this.generateUniqueUrlForResource(url);
		const sparqlUpdate = `
		<${messageUrl}> a <${namespaces.schema}Message>;
			<${namespaces.schema}givenName> <${psUsername}>;
			<${namespaces.schema}friendName> <${psFriendname}>;
			<${namespaces.schema}date> <${date}>;
		  <${namespaces.schema}text> <${messageTx}>.
	  `;
        
		try {
		//	await dataSync.executeSPARQLUpdateForUser(userDataUrl, `INSERT DATA {${sparqlUpdate}}`);
		await dataSync.sendToFriendsInbox(await userDataUrl, sparqlUpdate);
		} catch (e) {
			console.err("Could not save new message.");
		}

		if (toSend) {
			try {
                await dataSync.sendToFriendsInbox(await this.getUrl(friendWebId, "inbox/"), sparqlUpdate);
                
			} catch (e) {
				console.err("Could not send message to friend.");
			}
		}

  }
  
  async generateUniqueUrlForResource(baseurl) {
    let url = baseurl + "#" + uniqid();

    try {
      let d = this.getObjectFromPredicateForResource(url, namespaces.rdf + "type");

      while (d) {
        url = baseurl + "#" + uniqid();
        d = await this.getObjectFromPredicateForResource(url, namespaces.rdf + "type");
      }
    } catch (e) {
      console.err("ERROR 404");
    } finally {
      return url;
    }
  }
  
}
module.exports = DeChatCore
