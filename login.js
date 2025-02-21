const express = require('express');
const oauth = require('simple-oauth2');
const fetch = require('node-fetch');

/* --- Fill in your app config here --- */
const port = 9080;
const client = new oauth.AuthorizationCode({
  client: {
    id: 'ckS0HR27DBrgPQo6',
    secret: 'hil6cT0hbPTIbevd1mXlFNfOfFBYhPMK'
  },
  auth: {
    tokenHost: 'https://oauth.lichess.org',
    authorizePath: '/oauth/authorize',
    tokenPath: '/oauth'
  },
  http: {
    json: true
  }
});
const redirectUri = `https://puzzlebattles.herokuapp.com/callback`;
const authorizationUri = client.authorizeURL({
  redirect_uri: redirectUri,
  scope: ['preference:read'], // see https://lichess.org/api#section/Introduction/Rate-limiting
  state: Math.random().toString(36).substring(2)
});
/* --- End of your app config --- */

const app = express();

app.get('/login', (_, res) => res.send('Hello<br><a href="/auth">Log in with lichess</a>'));

app.get('/auth', (_, res) => res.redirect(authorizationUri));

app.get('/callback', async (req, res) => {
  const token = await client.getToken({
    code: req.query.code,
    redirect_uri: redirectUri
  });
  const user = await fetch('https://lichess.org/api/account', {
    headers: {
      'Authorization': `Bearer ${token.token.access_token}`
    }
  }).then(res => res.json());
  res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(user)}</pre>`);
});

