const syllLib = require('syllable'); //check syllables of words
const superagent = require('superagent'); //make HTTP request to the Datamuse API
function makeLine (numSyllables, wordPool) { //make line with words given a number (haiku lines are 5, 7, 5) and possible words relating to the input word
  if (numSyllables == 0 || numSyllables != parseInt(numSyllables, 10)) {
    numSyllables = 5;
  }
  let line = '';
  let totalNumSyllables = 0;
  while (totalNumSyllables < numSyllables) {
    line += ' ' + wordPool[Math.floor(Math.random() * wordPool.length)].word;
    totalNumSyllables = syllLib(line);
    if (totalNumSyllables > numSyllables) {
      line = '';
      totalNumSyllables = 0;
    }
  }
  return line.trim();
};
exports.handler = async function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  let inbMsg = event.Body.toLowerCase().trim(); //get inbound word
  if(inbMsg.slice(-1) == "s") { //remove "s" presuming that means the word is plural because Datamuse returns more words relating to singular than plural words
    inbMsg = inbMsg.slice(0,-1);
  }
  superagent.get(`https://api.datamuse.com/words`) //hit the Datamuse API
  .query({rel_jja: inbMsg, max: 100}) //query words related to inbound SMS word
  .end((err, res) => {
    if(res.body.length == 0) { //Datamuse doesn't have any related words
      twiml.message(`Oh no I'm sorry \nYour haiku is out to eat \nTry a different word`); //haiku if no words related to input SMS
      return callback(null, twiml);
    }
    let haiku = `${makeLine(5, res.body)} \n${makeLine(7, res.body)}\n${makeLine(5, res.body)}`; //generate haiku by calling the makeLine function from above 3x with the input word and correct syllables for each line
    twiml.message(haiku);
    return callback(null, twiml);  
  });
}
