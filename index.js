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
    border: 1px solid red;
  }

  input:valid {
    border: 1px solid green;
  }

  #number:invalid+span:before,
  #msg:invalid+span:before {
      content: " ✗ ";
      color: red;
  }

  #number:valid+span:before,
  #msg:valid+span:before {
      content: " ✓ ";
      color: green;
  }
</style>
<h1>Welcome to Will's demo Twilio bot.</h1>
<form action="/send" method="post">
  <div>
    <label for="number">Number: </label>
    <input type="text" id="number" name="number" required
           placeholder="+12223334444" pattern="[+]1[0-9]{10}"
           style="">
    <span>&nbsp;</span>
  </div>
  <br>
  <div>
    <label for="msg">Message: </label>
    <input type="text" id="msg" name="msg" rows=3 required>
    <span>&nbsp;</span>
  </div>
  <br>
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
  client.messages
    .create({
      to: req.body.number,
      from: TWILIO_NUMBER,
      body: req.body.msg,
    }, (err, message) => {
      if (err) {
        res.status(err.status)
           .send(err.message)
           .end();
      } else {
        res.status(200)
           .send(`ID: ${message.sid}<br>
                  To: ${message.to}<br>
                  Body: ${message.body}<br>
                  Created: ${message.dateCreated}<br>
                  <a href='/'>Back</a>`)
           .end();
      }
    });
});

app.post('/receive', (req, res) => {
  const twiml = new MessagingResponse();
  if (req.body.Body == "yes") {
    twiml.message(`You said "yes." Woohooooo!`);
  } else if (req.body.Body == "no") {
    twiml.message(`You said "no." :'(`);
  } else {
    twiml.message(`"${req.body.Body}" is not "yes" or "no"`);
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
