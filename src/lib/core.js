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
  
}
module.exports = DeChatCore
