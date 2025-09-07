const TMI = require('tmi.js');    // imports use of tmi.js located in
const fs = require("fs");
const { log } = require("./common");

// init all known users and their commands
const configPath = "./user-commands.json";
let userCommands = JSON.parse(fs.readFileSync("user-commands.json", "utf-8"));


const BOT_NAME = process.argv[2];
const ACCESS_TOKEN = process.argv[3];
log(`twitch-bot.js | ${BOT_NAME}`)
log(`twitch-bot.js | ${ACCESS_TOKEN}`)

// create twitch api obj
const opts = {
  identity: {
    username: BOT_NAME,
    password:  ACCESS_TOKEN
  },
  channels:Object.keys(userCommands).filter(ch => ch !== "reset-env")
};

let client;
client = new TMI.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on("notice", (channel, msgid, message) => {
  log(`twitch-bot.js: [NOTICE from Twitch] ${channel}: ${msgid} - ${message}`);
});
client.connect();
client.getChannels().forEach(ch => log(`Joined channel: ${ch}`));

// whenever it detects a restart in .json it resets twtich api obj
function softRestart() {
  log(`twitch-bot.js: Soft restart started`)

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  config["reset-env"] = false;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  const opts = {
    identity: {
      username: BOT_NAME,
      password:  ACCESS_TOKEN
    },
    channels:Object.keys(userCommands).filter(ch => ch !== "reset-env")
  };


  log(`twitch-bot.js: Channels in user-commands.js: ${Object.keys(userCommands).filter(ch => ch !== "reset-env")}`)


  client = new TMI.client(opts);
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  log("twitch-bot.js: Soft restart completed!");
}


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
function onMessageHandler (channel, context, message, self) {
  const user = context.username;
  const msg = message.toLowerCase().trim();


  //checks to see if twitch-bot.js needs to be soft reset, if it does soft restart
  let userCommands = JSON.parse(fs.readFileSync("user-commands.json", "utf-8"));
  if (userCommands['reset-env'] == true){
    client.disconnect();
    softRestart();
  }
  

  // checks if command is available per 
  let commandComplete = false;

  // checks text commands per user
  let commandsForChannel = userCommands[channel];
  if (commandsForChannel && msg in commandsForChannel) {
    client.say(channel, `${commandsForChannel[msg]}`);
    commandComplete = true;
  }

  else if(msg === '!flipacoin') {
    num = parseInt(Math.random() * 2) + 1;
    if (num == 1){client.say(channel, `@${user} got heads`);}
    else{client.say(channel, `@${user} got tails`);}
	  commandComplete = true;
  }

  else if(DICEROLL_PATTERN.test(msg)){
    client.say(channel, `@${user} ${diceRoll(msg)}`);
	  commandComplete = true;

  }
  
  if (commandComplete == true){
    log(`twitch-bot.js: ${client.getUsername()} responded to ${msg} by ${user} on ${channel}`);    commandComplete = false;
  }
 
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  log(`twitch-bot.js: ${client.getUsername()} connected to twitch`);
}