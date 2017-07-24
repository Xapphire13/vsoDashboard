import * as express from "express";
import * as path from "path";
import {ServerOAuthHelper} from "./ServerOAuthHelper";
import * as fs from "fs";

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
let clientSecret = JSON.parse(fs.readFileSync('secrets/clientSecret.json', 'utf8'))["clientSecret"];
let redirectUri = "https://vsodash.azurewebsites.net/auth";
let app = express();

app.set('port', process.env.PORT || 80);

// Static files
app.use(express.static(path.join(__dirname, "/../", "client")));
app.use("/scripts", express.static(path.join(__dirname, "/../", "shared")));
app.use("/auth", express.static(path.join(__dirname, "/../", "client/auth.html")), () => {
  console.log("Auth redirect");
});

app.get("/token", (req, res) => {
  let oAuthHelper = new ServerOAuthHelper(clientSecret, redirectUri);

  let accessCode = req.query["accessCode"];
  let refreshToken = req.query["refreshToken"];

  if(accessCode != undefined && accessCode != "") {
    console.log("Getting Access Token");
    oAuthHelper.getAccessToken(accessCode).then(accessToken => {
      console.log("Got access token");
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.send(accessToken);
    });
  } else if(refreshToken != undefined && refreshToken != "") {
    console.log("Refreshing Access Token");
    oAuthHelper.refreshAccessToken(refreshToken).then(accessToken => {
      console.log("Got access token");
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.send(accessToken);
    });
  } else{
    res.statusCode = 400;
    res.send();

  }
});

// Start server
let server = app.listen(app.get('port'), () => {
  console.log("Listening on port " + server.address().port);
});
