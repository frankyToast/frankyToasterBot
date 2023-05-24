const tmi = require('tmi.js');
require('dotenv').config()

// Define configuration options
const opts = {
  identity: {
    username: 'frankytoaster',
    password: 'o963lifj9zhdmi7dn5rzr0swg1px3g'
  },
  channels: ['frankytoast']
};

const diceRolls = {
  0: true,
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
  "d": true,
  "!": true
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
    
    // Remove whitespace from chat message
  const commandName = msg.trim();
  if (!(commandName[0]==='!')) { return; } // Ignore messages from the bot

  switch(commandName){
    case "!discord":
      client.say(target, `Come join the Toaster Discord! https://discord.gg/5U3K82F7Hw`);
      break;
      
    case "!lurk":
      client.say(target, `WE CRAWL AND SEEP INSIDE THE SKIN`);
      break;

    case "!flipacoin":
      num = numRand(2);
      if (num == 1){
        client.say(target, `You got heads`);
      } else{
        client.say(target, `You got tails`);
      }
      break;

    default:
      if (diceRollCheck(commandName)){
        client.say(target, `${diceRoll(commandName)}`);
      }
  }

}

function diceRollCheck(commandName){
  var dcharIndex = -1;
  var dCount = 0;
  
  // goes through each char in command and checks it
  for(let i = 0; i < commandName.length; i++){
    var character = String(commandName[i])
    // checks if a char is not part of the diceRolls char
    if (!(character in diceRolls)){
      console.log(character);
      console.log(`CHAR NOT IN DICEROLL`);
      return false;
    }

    // if it contains d it takes the index and count
    if (character === "d"){
      dcharIndex = i;
      dCount ++;
      // if there is more than 1 d it's invalid
      if (dCount > 1){
        console.log(`MULTIPLE D CHAR`);
        return false;
      }
    }
  }

  // If d does not exist or is at the end of the command
  if (dcharIndex === -1 || dcharIndex === (commandName.length -1)){
    console.log(`INVALID D CHAR PLACEMENT`);
    return false;
  }

  return true;
}

function diceRoll(commandName){

  // finds the index of the D in the command
  var dcharIndex = 0;
  for(let i = 0; i < commandName.length; i++){
    var character = String(commandName[i])
    if (character === "d"){dcharIndex = i;}
  }

  // find the number of rolls 
  var numRolls = 1
  if(dcharIndex > 1){
    charNumRoll = commandName.substring(1,dcharIndex+1)
    numRolls = parseInt(charNumRoll)
  }

  // find the size of the dice
  var diceSize = 0;
  charDiceSize = commandName.substring(dcharIndex+1,commandName.length)
  diceSize = parseInt(charDiceSize)
  
  // finds the sum of the num of rolls
  var sum = 0
  for (let i = 0; i < numRolls; ++i){
    sum += numRand(diceSize)
  }

  if (numRolls == 1){
    return `After rolling a ${diceSize} die, ${numRolls} time, you got ${sum}`;
  } else{
    return `After rolling a ${diceSize} die, ${numRolls} times, you got ${sum}`;

  }
}

// Function called when the "dice" command is issued
function numRand (num) {
  const sides = num;
  return parseInt(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}