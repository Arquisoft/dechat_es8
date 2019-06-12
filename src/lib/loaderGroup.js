const SemanticGroupChat = require('./semanticGroupchat')
const Loader = require('./loader')

/**
 * The Loader allows creating a Semantic Chess instance via information loaded from an url.
 */
class Loadergroup extends Loader{
  /**
   * This constructor creates an instance of Loader.
   * @param fetch: the function used to fetch the data
   */
  constructor (fetch) {
    this.engine = newEngine()
    this.fetch = fetch
  }

  /**
   * This method loads the messages from the url passed through the parameter
   */
   async loadGroupFromUrl (chatUrl, userWebId, chatBaseUrl) {
    // const interlocutorWebId = await this.findWebIdOfInterlocutor(chatUrl, userWebId);
    // console.log(interlocutorWebId);

	var interlocutors = await this.findWebIdOfInterlocutor(chatUrl, userWebId);
    const chat = new SemanticGroupChat({
      url: chatUrl,
      chatBaseUrl,
      userWebId
      interlocutorsWebId:interlocutors
    })
    const messages = await this._findMessage(chatUrl)

    for (var i = 0, len = messages.length; i < len; i++) {
      chat.loadMessage(messages[i])
    }
    return chat
  }
  
module.exports = Loadergroup
