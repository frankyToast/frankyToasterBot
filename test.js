const fs = require("fs");
const rawData = fs.readFileSync("user-commands.json", "utf-8");
const channels = JSON.parse(rawData);

channels.forEach(ch => {
  console.log(`Channel: ${ch.CHANNEL}`);
  console.log("Commands:", ch.COMMANDS);
});

