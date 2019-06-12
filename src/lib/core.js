const namespaces = require("./namespaces");
//Sirve para poder trabajar con Promises
const Q = require("q");
//Sirve para hacer consultas SPARQL
const newEngine = require("@comunica/actor-init-sparql-rdfjs").newEngine;
const rdfjsSourceFromUrl = require("./rdfjssourcefactory").fromUrl;

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
}
module.exports = DeChatCore
