const N3 = require('n3')
const Q = require('q')

/**
 * This method returns an RDFJSSource of an url
 * @param {string} url: url of the source
 * @returns {Promise}: a promise that resolve with the corresponding RDFJSSource
 */
function fromUrl(url, fetch) {
  const deferred = Q.defer();

  fetch(url)
    .then(res => {
      if (res.status === 404) {
        deferred.reject(404);
      } else {
        const body = res.text();
        const store = N3.Store();
        const parser = N3.Parser({baseIRI: url});

        parser.parse(body, (err, quad, prefixes) => {
          if (err) {
            deferred.reject();
          } else if (quad) {
            store.addQuad(quad);
          } else {
            const source = {
              match: function (s, p, o, g) {
                return require("streamify-array")(store.getQuads(s, p, o, g));
              }
            };

            deferred.resolve(source);
          }
        });
      }
    }).catch(reason => {
    deferred.resolve(null);
  });

  return deferred.promise;
}


module.exports = {
  fromUrl
}
