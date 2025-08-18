// imports
const express = require('express');
const axios = require('axios');

require('dotenv').config(); // allows to put sensitive information in .env file


const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code found. Make sure you authorize the app!');

  console.log('OAuth code:', code);

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

    const { access_token, refresh_token, expires_in } = response.data;
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires in:', expires_in);

    res.send('Token received! Check the console.');
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send('Error exchanging code.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Visit this URL to authorize your bot:`);
  console.log(`https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=chat:read+chat:edit`);
});
