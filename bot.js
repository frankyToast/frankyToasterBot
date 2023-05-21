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
      num = rollDice(2);
      if (num == 1){
        client.say(target, `You got heads`);
      } else{
        client.say(target, `You got tails`);
      }
      break;

    default:
      subCommands(commandName)
  }

}

function subCommands(commandName){
  console.log(`* Unknown command ${commandName}`);
}

// Function called when the "dice" command is issued
function rollDice (num) {
  const sides = num;
  return parseInt(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}