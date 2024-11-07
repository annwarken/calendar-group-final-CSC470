const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", function(req, res) {
    let contents = fs.readFileSync("./html/HelloWorld.html");
    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

const PORT = 8080;
const HOST = '192.168.1.104';
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });