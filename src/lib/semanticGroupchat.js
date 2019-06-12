const SemanticChat = require('./semanticchat')

class SemanticGroupChat extends SemanticChat{
  constructor (options) {
	super(options);
    this.interlocutorsWebId = options.interlocutorsWebId
	this.totalInterlocutorsWebId = 0
  }

	interlocutorsWebIdSave(interlocutorsWebId) {
        this.interlocutorsWebId[this.totalInterlocutorsWebId] = interlocutorsWebId;
        this.totalInterlocutorsWebId += 1;
    }
	
  getInterlocutorsWebId () {
    return this.interlocutorsWebId
  }
}

module.exports = SemanticGroupChat
