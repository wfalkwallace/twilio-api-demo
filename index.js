const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const MessagingResponse = twilio.twiml.MessagingResponse;

const PORT = process.env.PORT || 5000;
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const html = `
<style>
  input:invalid {
    border: 2px dashed red;
  }

  input:valid {
    border: 2px solid black;
  }
</style>
<h1>Welcome to Will's demo Twilio bot.</h1>
<form action="/send" method="post">
  <div>
    <label for="number">Number: </label>
    <input type="text" id="number" name="number" required
           placeholder="+12223334444" pattern="[+]1[0-9]{10}"
           style="">
  </div>
  <div>
    <label for="message">Message: </label>
    <textarea id="message" name="message"></textarea>
  </div>
  <button>Submit</button>
</form>
`;

app.get('/robots.txt', (req, res) => {
  res.status(200)
     .send(`User-agent: *\nDisallow: /`)
     .end();
});

app.get('/', (req, res) => {
  res.status(200)
     .send(html)
     .end();
});

app.post('/send', (req, res) => {
  console.log(`WILL: ${req.body.number}/${TWILIO_NUMBER}`);
  client.messages
    .create({
      to: req.body.number,
      from: TWILIO_NUMBER,
      body: req.body.message,
    })
    .then(message => {
      console.log(`WILL: ${JSON.stringify(message)}`);
      res.status(200)
         .send(message.sid)
         .end();
    });
});

app.post('/receive', (req, res) => {
  console.log(`WILL: ${JSON.stringify(req.body)}`)

  const twiml = new MessagingResponse();

  twiml.message('This is a response.');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
