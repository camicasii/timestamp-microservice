// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.get("/api/v1/:date", function (req, res) {
    const { date } = req.params;
    let input = Number(date);
    if (isNaN(input)) input = date;

    const date_ = new Date(input);

    if (date_.toString() === "Invalid Date") {
        res.json({ error: "Invalid Date" });
    } else {
        res.json({ unix: date_.getTime(), utc: date_.toUTCString() });
    }
});
app.get("/api", function (req, res) {
    res.json({ unix: Date.now(), utc: new Date().toUTCString() });
});

app.get("/api/whoami", function (req, res) {
  console.log(req.ip);
  console.log(req.headers["accept-language"]);
  res.json({ ipaddress: req.ip,
      language: req.headers["accept-language"],
       });
});



// listen for requests :)
var listener = app.listen(43697, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
