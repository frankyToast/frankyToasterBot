// imports
const express = require('express');
const axios = require('axios');
const fs = require("fs");
const { spawn } = require("child_process");

require('dotenv').config(); // allows to put sensitive information in .env file

const app = express();
const PORT = 3000;
const ENV_FILE = './.env';

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync("log.txt", `[${timestamp}] ${message}\n`);
}

log(`server.js: start of server`)
// Update .env vars as needed
function updateEnv(var_name, new_value) {
  let envVars = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');

  envVars = envVars.map(line => {
    if (line.startsWith(var_name)) return `${var_name}=${new_value}`;
    return line;
  });

  fs.writeFileSync(ENV_FILE, envVars.join('\n'));
  log(`server.js: Updated .env ${var_name} to ${new_value}.`);
}


//get the token from twitch
async function fetchToken({ code = null } = {}) {
  if (!code) throw error;

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });
    
    // console.log(response)
    const { access_token, refresh_token, expires_in } = response.data;

    updateEnv("ACCESS_TOKEN", access_token);
    updateEnv("REFRESH_TOKEN", refresh_token);
    updateEnv("EXPIRES_IN", expires_in);
  
    startCountdown(expires_in);

  } catch (err) {
    log(`server.js: Token fetch error: ${err.response?.data || err.message}`);
    throw err;
  }
}

async function refreshAccessToken({ code = null } = {}) {
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

  startCountdown(expires_in);
  log(`server.js: refreshed the tokens`);
}


async function startCountdown(countdown) {
  while (true){
    tmiProcess = spawn("node", ["./twitch-bot.js"], {stdio: "inherit",});
    
    countdown = process.env.EXPIRES_IN;
    while(countdown>120){
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second
      countdown--;
      // console.log(countdown)
    }

    tmiProcess.kill();              // kills the script
    tmiProcess = null;
    refreshAccessToken();           // returns new access_token + expires_in
  }
}


app.get("/twitch-auth", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided!");

  try {
    await fetchToken({ code }); // just call the function
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
