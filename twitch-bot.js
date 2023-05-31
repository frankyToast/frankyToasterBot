const tmi = require('tmi.js');
require('dotenv').config();
const mc_twitch_chat = false;

// Define configuration options
const opts = {
  identity: {
    username: process.env.bot,
    password:  process.env.pass
  },
  channels:[process.env.channels]
};

// Valid syntax for diceRoll commands
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
//Checks to see who submitted the commit

  // console.log(target.substring(1));

  const command = msg.trim();
//Checks if message is a command
  if (!(command[0]==='!')) { return; } // Ignore messages from the bot

  switch(command){
    case "!discord":
      client.say(target, `Come join the Toaster Discord! https://discord.gg/5U3K82F7Hw`);
      break;
      
    case "!lurk":
      client.say(target, `WE CRAWL AND SEEP INSIDE THE SKIN`);
      break;

    case "!flipacoin":
      num = parseInt(Math.random() * 2) + 1;
      if (num == 1){
        client.say(target, `${target} got heads`);
      } else{
        client.say(target, `You got tails`);
      }
      break;
  }

  if (diceRollCheck(command)){
    client.say(target, `${diceRoll(command)}`);
  } 

}

// Verifies if the command is in a proper dice syntax
function diceRollCheck(command){
  var dcharIndex = -1;
  var dCount = 0;
  
  // goes through each char in command and checks it
  for(let i = 0; i < command.length; i++){
    var character = String(command[i])
    // checks if a char is not part of the diceRolls char
    if (!(character in diceRolls)){
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
  if (dcharIndex === -1 || dcharIndex === (command.length -1)){
    return false;
  }

  return true;
}

// the function for a dice roll
function diceRoll(command){

  // finds the index of the D in the command
  var dcharIndex = 0;
  for(let i = 0; i < command.length; i++){
    var character = String(command[i])
    if (character === "d"){dcharIndex = i;}
  }

  // find the number of rolls 
  var numRolls = 1
  if(dcharIndex > 1){
    charNumRoll = command.substring(1,dcharIndex+1)
    numRolls = parseInt(charNumRoll)
  }

  // find the size of the dice
  var diceSize = 0;
  charDiceSize = command.substring(dcharIndex+1,command.length)
  diceSize = parseInt(charDiceSize)
  
  // finds the sum of the num of rolls
  var sum = 0
  for (let i = 0; i < numRolls; ++i){
    diceRoll = parseInt(Math.random() * diceSize) + 1;
    sum += diceRoll
  }

  if (numRolls == 1){
    return `You got ${sum}!`;
  } else{
    return `After rolling a ${diceSize} die, ${numRolls} times, you got ${sum}`;

  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}