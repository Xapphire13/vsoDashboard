import "babel-polyfill";

import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import {ServerOAuthHelper} from "./ServerOAuthHelper";
import {IPreferences} from "../../shared/IPreferences"
import {SqlLiteHelper} from "./SqlLiteHelper"
import {UserDBHelper} from "./UserDBHelper"
import {VsoUserHelper} from "./VSO/VsoUserHelper"

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
let clientSecret = JSON.parse(fs.readFileSync(path.join(__dirname, './secrets/clientSecret.json'), 'utf8'))["clientSecret"];
let redirectUri = "https://vsodash.azurewebsites.net/auth";
let app = express();
let dbHelper = new SqlLiteHelper();
dbHelper.init();
let userDbHelper = new UserDBHelper();
let userHelper = new VsoUserHelper();

app.set('port', process.env.PORT || 80);

// Static files
app.use(express.static(path.join(__dirname, "../../client")));
app.use(bodyParser.json());
app.use("/scripts", express.static(path.join(__dirname, "/../", "shared")));
app.use("/auth", express.static(path.join(__dirname, "../../client/auth.html")), () => {
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

app.get("/preferences", async (req, res) => {
  let token = req.headers["authorization"];
  if (token == null) {
      res.statusCode = 401;
      res.send();
      return;
  }

  let userId = await userHelper.getUserId(token.toString());
  if (userId == null) {
      res.statusCode = 401;
      res.send();
      return;
  }

  let response = await userDbHelper.getUserPreferences(dbHelper, userId)
  res.statusCode = 200;
  res.send(response);
});

app.post("/preferences", async (req, res) => {
  let body = <IPreferences>req.body;
  if (body == null) {
    res.statusCode = 400;
    res.send();
    return;
  }

  let token = req.headers["authorization"];
  if (token == null) {
      res.statusCode = 401;
      res.send();
      return;
  }

  let userId = await userHelper.getUserId(token.toString());
  if (userId == null) {
      res.statusCode = 401;
      res.send();
      return;
  }
  await userDbHelper.updateUserPreference(dbHelper, body, userId);

  res.statusCode = 200;
  res.send(body);
});

// Start server
let server = app.listen(app.get('port'), () => {
  console.log("Listening on port " + server.address().port);
});

process.on("exit", () => {
    console.error("Server crashed");
});
