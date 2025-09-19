// imports
const express = require('express');
const axios = require('axios');
// const fs = require("fs");
const { spawn } = require("child_process");
const { updateEnv, log } = require("./common");
const { ref } = require('process');

require('dotenv').config(); 
const ENV_FILE = './.env';

let ACCESS_TOKEN, REFRESH_TOKEN, EXPIRES_IN;

const app = express();
const PORT = 3000;

log(`server.js: start of server`)

//get the token from twitch
async function FetchToken({ code = null } = {}, refresh = false) {
  try{
    let response;

    if (refresh == true){
      let refreshToken = REFRESH_TOKEN;
      if (!refreshToken) throw new Error("No refresh token available");

      response = await axios.post(
        "https://id.twitch.tv/oauth2/token",
        null,
        {params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },}
      );

    } else{
      if (!code) throw new Error("No code provided");
      response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.TWITCH_AUTH_URL
        }}
      );
    }
    
    const { access_token, refresh_token, expires_in } = response.data;

    ACCESS_TOKEN = access_token;
    REFRESH_TOKEN = refresh_token;
    EXPIRES_IN = expires_in;
    // startCountdown(125);    //test
  
  } catch (err) {
    log(`server.js: FetchToken funct error: ${err.response?.data || err.message}`);
    throw err;
  }
}


async function Twitch_Auth({code = null} = {}){
  try{

    if (code) {
      await FetchToken({ code });
    }

    tmiProcess = null;

    while(true){
      
      if (tmiProcess) {tmiProcess.kill();}
      tmiProcess = spawn(
        "node",
        ["./twitch-bot.js", process.env.BOT, ACCESS_TOKEN],
        {stdio: "inherit"}
      );
      
      const refreshTime = (EXPIRES_IN - 120) * 1000;
      await new Promise(resolve => setTimeout(resolve, refreshTime));

      await FetchToken({}, refresh = true);
    }
  }
  catch(err){
    log(`server.js: Twitch_Auth error: ${err.response?.data || err.message}`);
    throw err;
  }

}


// Server Response to Twitch
app.get("/twitch-auth", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.send("No code provided!");

    Twitch_Auth({ code }); // just call the function
    res.send("Token received, check console!");

  } catch {
    res.send("Error exchanging code.");
  }
});

app.get("/", (req, res) => {
  res.send("Express is running!");
});

app.listen(PORT, () => {
  log(`server.js: access website to authorize twitch https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.TWITCH_AUTH_URL)}&response_type=code&scope=chat:read+chat:edit`);
});