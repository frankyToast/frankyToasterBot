// imports
const express = require('express');
const axios = require('axios');
const fs = require("fs");
const { spawn } = require("child_process");
const { updateEnv, log } = require("./common");
require('dotenv').config(); 


const app = express();
const PORT = 3000;
const ENV_FILE = './.env';

log(`server.js: start of server`)

//get the token from twitch
async function FetchToken({ code = null } = {}) {
  try{
    if (!code) throw err;
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });
    
    const { access_token, refresh_token, expires_in } = response.data;
    updateEnv("ACCESS_TOKEN", access_token);
    updateEnv("REFRESH_TOKEN", refresh_token);
    updateEnv("EXPIRES_IN", expires_in);

    CountDown(expires_in);
    // startCountdown(125);    //test
  
  } catch (err) {
    log(`server.js: Token fetch error: ${err.response?.data || err.message}`);
    throw err;
  }
}

async function RefreshAccessToken({ code = null } = {}) {
  try{
    let refreshToken = process.env.REFRESH_TOKEN;
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    updateEnv("ACCESS_TOKEN", access_token);
    updateEnv("REFRESH_TOKEN", refresh_token);
    updateEnv("EXPIRES_IN", expires_in);

    log(`server.js: refreshed the tokens`);

    CountDown(expires_in);
    // startCountdown(125);    //test

  } catch (err) {
    log(`server.js: Token refresh error: ${err.response?.data || err.message}`);
    throw err;
  }
}

async function CountDown(expires_in) {
  try{
    tmiProcess = spawn("node", ["./twitch-bot.js"], {stdio: "inherit",});
    
    const refreshTime = (expires_in - 120) * 1000;
    await new Promise(resolve => setTimeout(resolve, refreshTime));

    if (tmiProcess) {
      tmiProcess.kill();
      tmiProcess = null;
    }

    await RefreshAccessToken();

    } catch (err) {
      log(`server.js: CountDown error: ${err.response?.data || err.message}`);
      throw err;
    }
}


app.get("/twitch-auth", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.send("No code provided!");

    await FetchToken({ code }); // just call the function
    res.send("Token received, check console!");

  } catch {
    res.send("Error exchanging code.");
  }
});

app.get("/", (req, res) => {
  res.send("Express is running!");
});

app.listen(PORT, () => {
  log(`server.js: access website to authorize twitch https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=chat:read+chat:edit`);
});
