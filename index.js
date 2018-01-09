const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

const port = process.env.PORT || 5000;
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = twilio(accountSid, authToken);

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200)
     .send('App is Healthy')
     .end();
});

app.get('/send', (req, res) => {
  client.messages
    .create({
      to: '+19176793449',
      from: '+14159171086',
      body: 'yes?',
    })
    .then(message => {
      res.status(200)
         .send(message.sid)
         .end();
    });
});

app.post('/receive', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('This is a response.');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
