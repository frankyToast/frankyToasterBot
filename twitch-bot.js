const TMI = require('tmi.js');    // imports use of tmi.js located in
require('dotenv').config();       // allows to put sensitive information in .env file


// Define configuration options for tmi.js to log into Twitch Chatbot using info form .env
const opts = {
  identity: {
    username: process.env.bot,
    password:  process.env.BOT_OAUTH
  },
  channels:process.env.CHANNELS.split(",")
};


// Create TMI client to connect to Twitch
const client = new TMI.client(opts);

// assign event handlers for client for when it is connected and when a message appears
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();
console.log(process.env.channels)


/////////////////////////////////////////////////////////
//This section of code will be dedicated to the dice roll command

//regex pattern to check for dice roll command
const DICEROLL_PATTERN = /(?:^|\s)(!d\d+)(?=\s|[.,!?;:]|$)/gu;

// the function for a dice roll
function diceRoll(msg){
  const matches = msg.match(DICEROLL_PATTERN);

  let base_string = 'for '
  for(let i = 0; i < matches.length; i++){

    let max = parseInt(matches[i].slice(2));
    let rand_num = Math.floor(Math.random() * max) + 1;

    base_string += matches[i].slice(1) + " you got " + rand_num;

    if(i < matches.length-2){ base_string += "; for "}
    else if (i == matches.length-2){base_string += "; and for "}
    
  }

  return base_string
}

/////////////////////////////////////////////////////////

//designing the bot to respond to commands in chat
function onMessageHandler (target, context, msg, self) {
  user = context.username
  msg = msg.toLowerCase();

  if (self){return;}

  if(msg === '!discord') {
    client.say(target, `Come join the Toaster Discord! https://discord.gg/5U3K82F7Hw`);
  }

  if(msg === '!lurk') {
    client.say(target, `WE CRAWL AND SEEP INSIDE THE SKIN`);
  }

  if(msg === '!flipacoin') {
    num = parseInt(Math.random() * 2) + 1;
    if (num == 1){
      client.say(target, `@${user} got heads`);
    } else{
      client.say(target, `@${user} got tails`);
    }
  }

  if(DICEROLL_PATTERN.test(msg)){
    client.say(target, `@${user} ${diceRoll(msg)}`);
  }

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}